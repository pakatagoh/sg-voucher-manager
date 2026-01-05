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

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
};
