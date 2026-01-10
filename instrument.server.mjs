import * as Sentry from "@sentry/tanstackstart-react";

// Client-side uses VITE_ENVIRONMENT (bundled by Vite)
const environment = process.env.VITE_ENVIRONMENT ??  "production"

const sentrydsn = process.env.VITE_SENTRY_DSN

console.log(`[Sentry Server] VITE_ENVIRONMENT: ${process.env.VITE_ENVIRONMENT}`);
console.log(`[Sentry Server] Sentry DSN: ${sentrydsn}`);
console.log(`[Sentry Server] Initializing with environment: ${environment}`);
console.log(`[Sentry Server] Error tracking + metrics enabled - tracing disabled`);

const isDevelopment = environment === "development"; 

Sentry.init({
  dsn: sentrydsn,
  environment,
  // Disable PII to prevent request bodies from being captured
  sendDefaultPii: false,
  // Disable tracing completely - only track errors
  tracesSampleRate: 0,
  sampleRate: isDevelopment ? 1.0 : 0.5,
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

