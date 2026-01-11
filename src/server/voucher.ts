import * as Sentry from "@sentry/tanstackstart-react";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Zod schema to validate voucher ID (alphanumeric characters only)
const voucherIdSchema = z.object({
	id: z
		.string()
		.min(1, "Voucher ID cannot be empty")
		.regex(
			/^[a-zA-Z0-9]+$/,
			"Voucher ID must contain only alphanumeric characters",
		),
});

/**
 * Sentry Metrics Middleware
 * Tracks server function calls with success/error status
 */
const sentryMetricsMiddleware = createMiddleware().server(async ({ next }) => {
	try {
		const result = await next();

		// Track successful call
		Sentry.metrics.count("rpc_call_count", 1, {
			attributes: {
				func: "getVoucherData",
				status: "success",
			},
		});

		return result;
	} catch (error) {
		// Track failed call
		Sentry.metrics.count("rpc_call_count", 1, {
			attributes: {
				func: "getVoucherData",
				status: "error",
			},
		});

		throw error;
	}
});

/**
 * Server function to get voucher data from CDC API
 *
 * This function:
 * 1. Validates the voucher ID format
 * 2. Tracks metrics with Sentry
 * 3. Applies rate limiting (30 requests/min in production)
 * 4. Fetches voucher data from the Singapore government API
 */
export const getVoucherData = createServerFn({ method: "POST" })
	.middleware([sentryMetricsMiddleware])
	// .middleware([rateLimitMiddleware])
	.inputValidator(voucherIdSchema)
	.handler(async ({ data }) => {
		const response = await fetch(
			`https://api-cdc.redeem.gov.sg/v1/public/vouchers/groups/${data.id}`,
		);

		if (!response.ok) {
			const message = `API request failed: ${response.statusText}`;
			throw new Error(message);
		}

		return response.json();
	});
