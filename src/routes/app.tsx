import { createFileRoute, redirect } from "@tanstack/react-router";

// /app → /live  (permanent redirect to preserve old bookmarks)
export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    throw redirect({ to: "/live", replace: true });
  },
  component: () => null,
});
