import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type HitPayWebhookPayload = Record<string, unknown>;

const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256Hex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return hex(signature);
}

function normaliseSignature(signature: string | null) {
  return (
    signature
      ?.replace(/^sha256=/i, "")
      .trim()
      .toLowerCase() ?? ""
  );
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function textField(payload: HitPayWebhookPayload, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value) return value;
  }
  const nested = payload.payment_request;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    for (const key of keys) {
      const value = (nested as HitPayWebhookPayload)[key];
      if (typeof value === "string" && value) return value;
    }
  }
  return null;
}

function numericField(payload: HitPayWebhookPayload, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    const numberValue =
      typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(numberValue)) return numberValue;
  }
  const nested = payload.payment_request;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    for (const key of keys) {
      const value = (nested as HitPayWebhookPayload)[key];
      const numberValue =
        typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
      if (Number.isFinite(numberValue)) return numberValue;
    }
  }
  return null;
}

function paymentStatus(status: string | null) {
  const value = status?.toLowerCase() ?? "";
  if (["completed", "succeeded", "paid", "successful"].includes(value)) return "paid";
  if (["failed", "expired"].includes(value)) return "failed";
  if (["cancelled", "canceled"].includes(value)) return "cancelled";
  return "pending";
}

export async function handleHitPayWebhook(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const salt = process.env.HITPAY_WEBHOOK_SALT;
  if (!salt) {
    return new Response("HitPay webhook salt is not configured", { status: 500 });
  }

  const body = await request.text();
  const expected = await hmacSha256Hex(salt, body);
  const received = normaliseSignature(
    request.headers.get("Hitpay-Signature") ?? request.headers.get("X-Hitpay-Signature"),
  );

  if (!received || !safeEqual(expected, received)) {
    return new Response("Invalid HitPay signature", { status: 401 });
  }

  let payload: HitPayWebhookPayload;
  try {
    payload = JSON.parse(body) as HitPayWebhookPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const orderId = textField(payload, ["reference_number", "reference", "order_id"]);
  if (!orderId) {
    return new Response("Missing order reference", { status: 400 });
  }

  const status = textField(payload, ["status"]);
  const requestId = textField(payload, ["id", "payment_request_id", "request_id"]);
  const nextStatus = paymentStatus(status);

  const { data: order, error: loadError } = await supabaseAdmin
    .from("orders")
    .select("id,total,payment_status,paid_at,hitpay_payment_request_id")
    .eq("id", orderId)
    .single();

  if (loadError || !order) {
    return new Response(loadError?.message ?? "Order not found", { status: 404 });
  }

  const payloadAmount = numericField(payload, ["amount"]);
  if (payloadAmount != null && Math.abs(payloadAmount - Number(order.total)) > 0.01) {
    return new Response("Payment amount does not match the order total", { status: 400 });
  }

  if (order.payment_status === "paid") {
    return Response.json({ ok: true, idempotent: true });
  }

  const update: Database["public"]["Tables"]["orders"]["Update"] = {
    payment_provider: "hitpay",
    payment_status: nextStatus,
  };

  if (requestId) update.hitpay_payment_request_id = requestId;
  if (nextStatus === "paid") update.paid_at = order.paid_at ?? new Date().toISOString();
  if (nextStatus !== "paid" && order.paid_at == null) update.paid_at = null;

  const { error } = await supabaseAdmin.from("orders").update(update).eq("id", orderId);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return Response.json({ ok: true });
}
