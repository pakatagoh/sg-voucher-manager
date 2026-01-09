import * as Sentry from "@sentry/tanstackstart-react";

// Determine environment - prioritize NODE_ENV which Vite sets automatically
const isDevelopment = process.env.NODE_ENV === "development";
// Server-side: Use ENVIRONMENT (set in Netlify)
// Client-side uses VITE_ENVIRONMENT (bundled by Vite)
const environment = process.env.ENVIRONMENT ?? (isDevelopment ? "development" : "production");

console.log(`[Sentry Server] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[Sentry Server] ENVIRONMENT: ${process.env.ENVIRONMENT}`);
console.log(`[Sentry Server] Initializing with environment: ${environment}`);
console.log(`[Sentry Server] Error tracking + metrics enabled - tracing disabled`);

Sentry.init({
  dsn: "https://90dbc39bab91395cf00be295035334b7@o4510681070829568.ingest.de.sentry.io/4510681076990032",
  environment,
  // Disable PII to prevent request bodies from being captured
  sendDefaultPii: false,
  // Disable tracing completely - only track errors
  tracesSampleRate: 0,
  integrations: [],
  // Enable metrics aggregator
  _experiments: {
    metricsAggregator: true,
  },
});

console.log("[Sentry Server] Initialization complete - Error tracking + metrics enabled");
console.log("[Sentry Server] Sentry.metrics available:", typeof Sentry.metrics);

// // Test metric on startup to verify it's working
// try {
//   Sentry.metrics.count("sentry_init_test", 1, {
//     attributes: {
//       environment,
//       type: "server_startup",
//     },
//   });
//   console.log("[Sentry Server] Test metric sent successfully");
// } catch (error) {
//   console.error("[Sentry Server] Failed to send test metric:", error);
// }

