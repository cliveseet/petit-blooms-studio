import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { AppErrorBoundary } from "@/components/site/AppErrorBoundary";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-forest-deep">404</h1>
        <h2 className="mt-4 font-display text-2xl text-forest-deep">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for has wandered off. Let us take you back.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-sm text-cream transition-colors hover:bg-forest-deep"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  void error;
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-forest-deep">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-forest px-5 py-2.5 text-sm text-cream hover:bg-forest-deep"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-forest/30 px-5 py-2.5 text-sm text-forest-deep hover:bg-forest/5"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "petit blooms — Build-to-order florals in Singapore" },
      {
        name: "description",
        content:
          "Hand-tied bouquets and wedding florals from a WSQ-trained florist in Singapore. Build-to-order, delivered with care.",
      },
      { property: "og:title", content: "petit blooms — Build-to-order florals" },
      {
        property: "og:description",
        content: "Hand-tied bouquets and wedding florals from a WSQ-trained florist in Singapore.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <AppErrorBoundary>
                <Outlet />
              </AppErrorBoundary>
            </main>
            <Footer />
          </div>
          <CartDrawer />
          <Toaster richColors position="bottom-center" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
