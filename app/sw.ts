import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const OFFLINE_FALLBACK = "/offline";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: OFFLINE_FALLBACK,
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
  runtimeCaching: [
    // Never cache admin or auth-y routes — always go to network
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/admin") ||
        url.pathname.startsWith("/api/admin"),
      handler: new NetworkOnly(),
    },
    // Mutations always go through to the network
    {
      matcher: ({ request, url }) =>
        url.pathname.startsWith("/api/") && request.method !== "GET",
      handler: new NetworkOnly(),
    },
    // GET /api/* — network-first so users see fresh data, fall back to cache offline
    {
      matcher: ({ request, url }) =>
        url.pathname.startsWith("/api/") && request.method === "GET",
      handler: new NetworkFirst({
        cacheName: "verse-api",
        networkTimeoutSeconds: 4,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          }),
        ],
      }),
    },
    // Supabase storage images — cache-first, long TTL
    {
      matcher: ({ url }) => url.hostname.endsWith(".supabase.co"),
      handler: new CacheFirst({
        cacheName: "verse-supabase-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          }),
        ],
      }),
    },
    // Google Fonts CSS — stale-while-revalidate
    {
      matcher: ({ url }) => url.origin === "https://fonts.googleapis.com",
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    // Google Fonts files — cache-first, very long TTL
    {
      matcher: ({ url }) => url.origin === "https://fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
