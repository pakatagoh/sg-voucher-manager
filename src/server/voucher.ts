import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rateLimitMiddleware } from "./middleware";

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
 * Server function to get voucher data from CDC API
 *
 * This function:
 * 1. Validates the voucher ID format
 * 2. Applies rate limiting (30 requests/min in production)
 * 3. Fetches voucher data from the Singapore government API
 */
export const getVoucherData = createServerFn({ method: "POST" })
	.inputValidator(voucherIdSchema)
	.middleware([rateLimitMiddleware])
	.handler(async ({ data }) => {
		const response = await fetch(
			`https://api-cdc.redeem.gov.sg/v1/public/vouchers/groups/${data.id}`,
		);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		return response.json();
	});
