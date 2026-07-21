import { QueryClient } from "@tanstack/react-query";
import { createRouter, createMemoryHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { Capacitor } from "@capacitor/core";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const history = typeof window !== 'undefined' && Capacitor.isNativePlatform()
    ? createMemoryHistory({ initialEntries: ['/app'] })
    : undefined;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(history ? { history } : {}),
  });

  return router;
};
