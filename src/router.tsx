import * as Sentry from "@sentry/tanstackstart-react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { NotFound } from "./components/NotFound";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				refetchOnWindowFocus: false,
			},
		},
	});

	const router = createRouter({
		routeTree,
		context: { queryClient },
		notFoundMode: "root",
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => <NotFound />,
	});
	if (!router.isServer) {
		const env = import.meta.env.VITE_ENVIRONMENT ?? "production";
		const isDevelopment = env === "development";

		Sentry.init({
			dsn: import.meta.env.VITE_SENTRY_DSN,
			environment: env,
			// Use the release injected by Vite at build time
			release: import.meta.env.VITE_SENTRY_RELEASE,

			// Disable PII to prevent automatic capture of cookies, IPs, request bodies
			sendDefaultPii: false,
			// Disable tracing to prevent request body capture
			tracesSampleRate: 0,
			sampleRate: isDevelopment ? 1.0 : 0.5,
			allowUrls: isDevelopment ? [] : [/^https:\/\/managevoucher\.sg\/.*/],
		});
	}

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
};
