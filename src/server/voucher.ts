import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Zod schema to validate CDC voucher URLs
const cdcVoucherUrlSchema = z.object({
	url: z
		.url({
			hostname: /^voucher\.redeem\.gov\.sg$/,
			protocol: /^https$/,
			error: "Invalid CDC Voucher URL",
		})
		.refine(
			(url) => {
				const parsed = new URL(url);
				const pathParts = parsed.pathname.split("/").filter(Boolean);
				return (
					parsed.hostname === "voucher.redeem.gov.sg" &&
					pathParts.length === 1 &&
					pathParts[pathParts.length - 1]
				);
			},
			{
				message: "Invalid CDC Voucher URL",
			},
		),
});

// Server function to get voucher data from CDC API
export const getVoucherData = createServerFn({ method: "POST" })
	.inputValidator(cdcVoucherUrlSchema)
	.handler(async ({ data }) => {
		// Extract the voucher ID from the URL server-side
		// We know this is safe because Zod validation passed
		const voucherUrl = new URL(data.url);
		const pathParts = voucherUrl.pathname.split("/").filter(Boolean);
		const id = pathParts[pathParts.length - 1];

		const response = await fetch(
			`https://api-cdc.redeem.gov.sg/v1/public/vouchers/groups/${id}`,
		);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		return response.json();
	});
