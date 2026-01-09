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
		Sentry.init({
			dsn: "https://90dbc39bab91395cf00be295035334b7@o4510681070829568.ingest.de.sentry.io/4510681076990032",
			environment: import.meta.env.VITE_ENVIRONMENT ?? "production",
			// Disable PII to prevent automatic capture of cookies, IPs, request bodies
			sendDefaultPii: false,
			// Disable tracing to prevent request body capture
			tracesSampleRate: 0,
			// Enable metrics aggregation
			_experiments: {
				metricsAggregator: true,
			},
			// Empty integrations array for minimal Sentry functionality (error tracking + metrics)
			integrations: [],
		});
	}

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
};
