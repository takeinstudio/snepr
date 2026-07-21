import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { type ReactNode, useState, useEffect } from "react";
import { SneprWordmark } from "@/components/SneprWordmark";

import appCss from "../styles.css?url";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { name: "color-scheme", content: "light only" },
      { name: "darkreader-lock", content: "true" },
      { name: "theme-color", content: "#FFFFFF" },
      { title: "Live Salon Queue App | Snepr" },
      {
        name: "description",
        content:
          "Skip the waiting room. See live salon queues, join from your phone, and walk straight into the chair. 100% free for customers.",
      },
      { name: "author", content: "Snepr" },
      { property: "og:site_name", content: "Snepr" },
      { property: "og:title", content: "Live Salon Queue App | Snepr" },
      {
        property: "og:description",
        content:
          "Skip the waiting room. See live salon queues, join from your phone, and walk straight into the chair. 100% free for customers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://snepr.in" },
      { property: "og:image", content: "https://snepr.in/android-chrome-512x512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Live Salon Queue App | Snepr" },
      { name: "twitter:description", content: "Skip the waiting room. See live salon queues, join from your phone, and walk straight into the chair. 100% free for customers." },
      { name: "twitter:image", content: "https://snepr.in/android-chrome-512x512.png" },
    ],
    links: [
      { rel: "canonical", href: "https://snepr.in" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
      { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#7A4B29" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              "name": "Snepr",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Android, iOS, Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "description": "Live salon wait times and walk-in queue management application.",
              "url": "https://snepr.in"
            },
            {
              "@type": "Organization",
              "name": "Snepr",
              "url": "https://snepr.in",
              "logo": "https://snepr.in/android-chrome-512x512.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "email": "support@snepr.in"
              }
            }
          ]
        }),
      }
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body className="light" style={{ colorScheme: "light" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setFadeSplash(true);
    }, 2000); // Wait 2s before fading
    const t2 = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Remove from DOM after 2.5s

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background font-sans text-ink selection:bg-primary/20">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] bg-[#1C1613] flex items-center justify-center transition-opacity duration-500 ${fadeSplash ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <SneprWordmark height={48} className="text-[#FAF8F5]" />
          </div>
        </div>
      )}

      <Toaster position="bottom-center" />
    </QueryClientProvider>
  );
}
