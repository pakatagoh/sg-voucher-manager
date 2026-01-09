import * as Sentry from "@sentry/tanstackstart-react";

// Determine environment - prioritize NODE_ENV which Vite sets automatically
const isDevelopment = process.env.NODE_ENV === "development";
const environment = process.env.VITE_ENVIRONMENT ?? (isDevelopment ? "development" : "production");

console.log(`[Sentry Server] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[Sentry Server] Initializing with environment: ${environment}`);
console.log(`[Sentry Server] Error tracking + metrics enabled - tracing disabled`);

Sentry.init({
  dsn: "https://90dbc39bab91395cf00be295035334b7@o4510681070829568.ingest.de.sentry.io/4510681076990032",
  environment,
  // Disable PII to prevent request bodies from being captured
  sendDefaultPii: false,
  // Disable tracing completely - only track errors
  tracesSampleRate: 0,
  // Enable metrics aggregation
  _experiments: {
    metricsAggregator: true,
  },
  integrations: [],
});

console.log("[Sentry Server] Initialization complete - Error tracking + metrics enabled");

