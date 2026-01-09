import * as Sentry from "@sentry/tanstackstart-react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import PrivacyDisclaimer from "@/components/PrivacyDisclaimer";
import { AddVoucherForm } from "@/components/voucher/AddVoucherForm";
import { SavedVouchersList } from "@/components/voucher/SavedVouchersList";

/**
 * Sentry Metrics Middleware for Route
 * Tracks page requests per second with status codes
 */
const metricsMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		console.log("[Metrics] Home route middleware triggered", {
			method: request.method,
		});

		try {
			const result = await next();
			const statusCode = result.response.status;
			const status =
				statusCode >= 200 && statusCode < 400 ? "success" : "error";

			console.log("[Metrics] Tracking page request", { statusCode, status });

			// Track page request with response status
			Sentry.metrics.count("page_request_count", 1, {
				attributes: {
					route: "/",
					page: "home",
					method: request.method,
					status_code: statusCode.toString(),
					status,
				},
			});

			return result;
		} catch (error) {
			console.error("[Metrics] Error in middleware", error);

			// Track failed request (exception thrown)
			Sentry.metrics.count("page_request_count", 1, {
				attributes: {
					route: "/",
					page: "home",
					method: request.method,
					status_code: "500",
					status: "error",
				},
			});

			throw error;
		}
	},
);

export const Route = createFileRoute("/")({
	component: App,
	server: {
		middleware: [metricsMiddleware],
	},
});

function App() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
			<PrivacyDisclaimer />
			<AddVoucherForm />
			<ClientOnly>
				<SavedVouchersList />
			</ClientOnly>
		</div>
	);
}
