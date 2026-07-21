import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { 
      preset: 'static',
      prerender: {
        routes: ['/', '/app', '/app/admin', '/app/queue', '/app/checkout', '/app/activity', '/app/profile']
      }
    },
  },
});
