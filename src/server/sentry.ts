import * as Sentry from "@sentry/tanstackstart-react";

// Only initialize on server side and if DSN is provided
if (typeof window === "undefined" && process.env.VITE_SENTRY_DSN) {
	// Server-side: Use ENVIRONMENT (set in Netlify)
	const isDevelopment = process.env.VITE_ENVIRONMENT === "development";
	// Client-side uses VITE_ENVIRONMENT (bundled by Vite)
	const environment =
		process.env.VITE_ENVIRONMENT ??
		(isDevelopment ? "development" : "production");

	console.log(
		`[Sentry Server] VITE_ENVIRONMENT: ${process.env.VITE_ENVIRONMENT}`,
	);
	console.log(`[Sentry Server] Initializing with environment: ${environment}`);
	console.log(
		`[Sentry Server] Error tracking + metrics enabled - tracing disabled`,
	);
	console.log(
		`[Sentry Server] VITE_SENTRY_DSN: ${process.env.VITE_SENTRY_DSN}`,
	);

	Sentry.init({
		dsn: process.env.VITE_SENTRY_DSN,
		environment,
		// Use the release injected by Sentry Vite plugin during build
		release: process.env.SENTRY_RELEASE,
		// Disable PII to prevent request bodies from being captured
		sendDefaultPii: false,
		// Disable tracing completely - only track errors
		tracesSampleRate: 0,
		// Enable metrics aggregator
		_experiments: {
			metricsAggregator: true,
		},
		// Keep integrations minimal but include what's needed for basic functionality
		integrations: [],
	});

	console.log(
		"[Sentry Server] Initialization complete - Error tracking + metrics enabled",
	);
	console.log(
		"[Sentry Server] Sentry.metrics available:",
		typeof Sentry.metrics,
	);
} else if (typeof window === "undefined" && !process.env.VITE_SENTRY_DSN) {
	console.log("[Sentry Server] VITE_SENTRY_DSN not set. Skipping Sentry initialization.");
}
