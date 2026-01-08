import { createServerFn } from "@tanstack/react-start";
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

// Server function to get voucher data from CDC API
export const getVoucherData = createServerFn({ method: "POST" })
	.inputValidator(voucherIdSchema)
	.handler(async ({ data }) => {
		const response = await fetch(
			`https://api-cdc.redeem.gov.sg/v1/public/vouchers/groups/${data.id}`,
		);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		return response.json();
	});
