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
import { TopBar } from "@/components/TopBar";
import { ClaimsProvider } from "@/context/ClaimsContext";
import { ToastHost } from "@/components/ToastHost";
import { ActivityProvider } from "@/context/ActivityContext";
import { ActivityFeed } from "@/components/ActivityFeed";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-slate-100">404</h1>
        <p className="mt-2 text-sm text-slate-400">
          That page doesn't exist in the Claims module.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-100">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-400">Try refreshing the page.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SihatSatu — Claims & GL Agent" },
      {
        name: "description",
        content:
          "SihatSatu Claims & GL Agent — Malaysian healthcare insurance claims and guarantee letters, automated.",
      },
      { property: "og:title", content: "SihatSatu — Claims & GL Agent" },
      { name: "twitter:title", content: "SihatSatu — Claims & GL Agent" },
      { name: "description", content: "Healtcare operations include everything that doctor and patients need" },
      { property: "og:description", content: "Healtcare operations include everything that doctor and patients need" },
      { name: "twitter:description", content: "Healtcare operations include everything that doctor and patients need" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/78f2ceb6-c3f8-4aaf-8e85-842859290172" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/78f2ceb6-c3f8-4aaf-8e85-842859290172" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      } as any,
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
      <ClaimsProvider>
        <ActivityProvider>
          <div className="min-h-screen bg-slate-900 text-slate-100">
            <TopBar />
            <main className="mx-auto max-w-7xl px-6 py-8">
              <Outlet />
            </main>
            <ToastHost />
            <ActivityFeed />
          </div>
        </ActivityProvider>
      </ClaimsProvider>
    </QueryClientProvider>
  );
}
