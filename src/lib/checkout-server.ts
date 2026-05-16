import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Buffer } from "node:buffer";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STORE_POSTAL = "570111";

const deliveryInput = z.object({
  postal: z.string().regex(/^\d{6}$/),
});

const paymentInput = z.object({
  orderId: z.string().uuid(),
  origin: z.string().url(),
});

type OneMapTokenCache = {
  token: string;
  expiresAt: number;
};

type OneMapTokenResponse = {
  access_token?: string;
  token?: string;
  expiry_timestamp?: number;
  expires_at?: number;
  error?: string;
  message?: string;
};

type OneMapSearchResponse = {
  found?: number;
  error?: string;
  results?: Array<{
    SEARCHVAL?: string;
    ADDRESS?: string;
    POSTAL?: string;
    LATITUDE?: string;
    LONGITUDE?: string;
  }>;
};

type OneMapRouteResponse = {
  error?: string;
  message?: string;
  status_message?: string;
  route_summary?: {
    total_distance?: number;
    total_time?: number;
  };
};

type HitPayResponse = {
  id?: string;
  url?: string;
  payment_url?: string;
  redirect_url?: string;
  status?: string;
  message?: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateBuckets = new Map<string, RateLimitBucket>();

function clientKey(prefix: string) {
  const request = getRequest();
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    request?.headers.get("cf-connecting-ip") ||
    request?.headers.get("x-real-ip") ||
    forwarded ||
    "anonymous";
  return `${prefix}:${ip}`;
}

function assertRateLimit(prefix: string, limit: number, windowMs: number) {
  const key = clientKey(prefix);
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  current.count += 1;
}

function feeFromDistance(distanceKm: number) {
  if (distanceKm < 5) return 20;
  if (distanceKm < 7.5) return 25;
  if (distanceKm < 10) return 30;
  if (distanceKm < 12.5) return 35;
  if (distanceKm < 15) return 40;
  if (distanceKm < 17.5) return 45;
  return 50;
}

let oneMapTokenCache: OneMapTokenCache | null = null;

function decodeTokenExpiry(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalised = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded =
      typeof atob === "function"
        ? atob(normalised)
        : Buffer.from(normalised, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { exp?: number };
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}

function cacheToken(token: string, expiresAt?: number) {
  oneMapTokenCache = {
    token,
    expiresAt: expiresAt || decodeTokenExpiry(token) || Math.floor(Date.now() / 1000) + 60 * 60,
  };
}

async function renewOneMapToken() {
  const email = process.env.ONEMAP_EMAIL;
  const password = process.env.ONEMAP_PASSWORD;

  if (!email || !password) {
    throw new Error("OneMap credentials are missing.");
  }

  const response = await fetch("https://www.onemap.gov.sg/api/auth/post/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = (await response.json().catch(() => ({}))) as OneMapTokenResponse;

  if (!response.ok) {
    throw new Error(payload.message || payload.error || "OneMap could not renew the token.");
  }

  const token = payload.access_token || payload.token;
  if (!token) {
    throw new Error("OneMap did not return an access token.");
  }

  cacheToken(token, payload.expiry_timestamp || payload.expires_at || undefined);
  return token;
}

async function getOneMapToken() {
  const now = Math.floor(Date.now() / 1000);
  const refreshWindow = 6 * 60 * 60;

  if (!oneMapTokenCache) {
    const bootstrap = process.env.ONEMAP_API_KEY;
    if (bootstrap) cacheToken(bootstrap);
  }

  if (oneMapTokenCache && oneMapTokenCache.expiresAt - now > refreshWindow) {
    return oneMapTokenCache.token;
  }

  return renewOneMapToken();
}

async function oneMapFetch<T>(url: string) {
  const token = await getOneMapToken();
  const response = await fetch(url, {
    headers: {
      Authorization: token,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || payload.error || "OneMap request failed.");
  }

  if (payload.error) {
    throw new Error(payload.message || payload.error);
  }

  return payload;
}

async function resolvePostal(postal: string) {
  const params = new URLSearchParams({
    searchVal: postal,
    returnGeom: "Y",
    getAddrDetails: "Y",
    pageNum: "1",
  });
  const payload = await oneMapFetch<OneMapSearchResponse>(
    `https://www.onemap.gov.sg/api/common/elastic/search?${params.toString()}`,
  );
  const result = payload.results?.find((item) => item.POSTAL === postal) ?? payload.results?.[0];
  const latitude = Number(result?.LATITUDE);
  const longitude = Number(result?.LONGITUDE);

  if (!result || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("No Singapore address was found for this postal code.");
  }

  return {
    latitude,
    longitude,
    address: result.ADDRESS || result.SEARCHVAL || postal,
  };
}

async function calculateOneMapDistance(destinationPostal: string) {
  const [origin, destination] = await Promise.all([
    resolvePostal(STORE_POSTAL),
    resolvePostal(destinationPostal),
  ]);
  const params = new URLSearchParams({
    start: `${origin.latitude},${origin.longitude}`,
    end: `${destination.latitude},${destination.longitude}`,
    routeType: "drive",
  });
  const payload = await oneMapFetch<OneMapRouteResponse>(
    `https://www.onemap.gov.sg/api/public/routingsvc/route?${params.toString()}`,
  );
  const distanceMetres = Number(payload.route_summary?.total_distance);

  if (!Number.isFinite(distanceMetres) || distanceMetres <= 0) {
    throw new Error(
      payload.status_message ||
        payload.message ||
        "OneMap could not return a driving distance for this postal code.",
    );
  }

  return {
    distanceKm: distanceMetres / 1000,
  };
}

function hitPayEndpoint() {
  const mode = process.env.HITPAY_MODE || process.env.VITE_HITPAY_MODE || "sandbox";
  return mode === "live"
    ? "https://api.hit-pay.com/v1/payment-requests"
    : "https://api.sandbox.hit-pay.com/v1/payment-requests";
}

function paymentMethods() {
  return (process.env.HITPAY_PAYMENT_METHODS || "card,paynow_online")
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean);
}

export const calculateDeliveryQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deliveryInput.parse(input))
  .handler(async ({ data }) => {
    assertRateLimit("delivery-quote", 20, 60_000);

    try {
      const distance = await calculateOneMapDistance(data.postal);
      const distanceKm = Number(distance.distanceKm.toFixed(2));

      return {
        postal: data.postal,
        fee: feeFromDistance(distance.distanceKm),
        distanceKm,
        source: "onemap" as const,
        checkedAt: new Date().toISOString(),
        message: `Driving distance: ${distance.distanceKm.toFixed(1)} km.`,
      };
    } catch (error) {
      const hasToken =
        Boolean(process.env.ONEMAP_API_KEY) ||
        (Boolean(process.env.ONEMAP_EMAIL) && Boolean(process.env.ONEMAP_PASSWORD));

      if (hasToken) {
        throw error instanceof Error
          ? error
          : new Error("OneMap could not return a delivery distance.");
      }

      return {
        postal: data.postal,
        fee: 50,
        distanceKm: null,
        source: "maximum_fallback" as const,
        checkedAt: new Date().toISOString(),
        message: "OneMap is not configured yet, so the maximum delivery fee has been applied.",
      };
    }
  });

export const createHitPayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => paymentInput.parse(input))
  .handler(async ({ data, context }) => {
    assertRateLimit("hitpay-create", 8, 60_000);

    const apiKey = process.env.HITPAY_API_KEY;
    if (!apiKey) {
      throw new Error("HitPay is not configured. Add HITPAY_API_KEY to the server environment.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id,user_id,total,contact_email,contact_name,contact_phone,payment_status,hitpay_payment_url,hitpay_payment_request_id",
      )
      .eq("id", data.orderId)
      .single();

    if (error || !order) {
      throw new Error(error?.message || "Order not found.");
    }

    if (order.user_id !== context.userId) {
      throw new Error("This order does not belong to the signed-in customer.");
    }

    if (order.payment_status === "paid") {
      throw new Error("This order has already been paid.");
    }

    if (order.payment_status === "pending" && order.hitpay_payment_url) {
      return {
        paymentUrl: order.hitpay_payment_url,
        requestId: order.hitpay_payment_request_id,
        status: "pending",
      };
    }

    const redirectUrl = new URL("/account", data.origin);
    redirectUrl.searchParams.set("payment", "hitpay");
    redirectUrl.searchParams.set("order", order.id);

    const amount = Number(order.total).toFixed(2);

    const response = await fetch(hitPayEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BUSINESS-API-KEY": apiKey,
      },
      body: JSON.stringify({
        amount,
        currency: "SGD",
        email: order.contact_email,
        name: order.contact_name,
        phone: order.contact_phone,
        purpose: `Petit Blooms order ${order.id.slice(0, 8)}`,
        reference_number: order.id,
        redirect_url: redirectUrl.toString(),
        payment_methods: paymentMethods(),
        send_email: true,
        send_sms: false,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as HitPayResponse;

    if (!response.ok) {
      throw new Error(payload.message || "HitPay could not create a payment request.");
    }

    const paymentUrl = payload.url || payload.payment_url || payload.redirect_url;
    if (!paymentUrl) {
      throw new Error("HitPay did not return a checkout URL.");
    }

    await supabaseAdmin
      .from("orders")
      .update({
        payment_provider: "hitpay",
        payment_status: "pending",
        hitpay_payment_request_id: payload.id ?? null,
        hitpay_payment_url: paymentUrl,
      })
      .eq("id", order.id);

    return {
      paymentUrl,
      requestId: payload.id ?? null,
      status: payload.status ?? "pending",
    };
  });
