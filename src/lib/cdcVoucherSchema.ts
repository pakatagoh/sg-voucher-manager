import { z } from "zod";

/**
 * Zod schema to validate CDC voucher URLs
 * Format: https://voucher.redeem.gov.sg/{voucherId}
 */
export const cdcVoucherUrlSchema = z.object({
	url: z
		.url({
			hostname: /^voucher\.redeem\.gov\.sg$/,
			protocol: /^https$/,
			error:
				"Invalid CDC Voucher URL. Your URL must start with https://voucher.redeem.gov.sg",
		})
		.refine(
			(url) => {
				try {
					const parsed = new URL(url);
					const pathParts = parsed.pathname.split("/").filter(Boolean);
					return (
						parsed.hostname === "voucher.redeem.gov.sg" &&
						pathParts.length === 1 &&
						pathParts[pathParts.length - 1]
					);
				} catch (error) {
					console.error(
						"Unable to parse URL in zod refinement: ",
						error instanceof Error ? error.message : String(error),
					);
					return false;
				}
			},
			{
				message: `Invalid CDC Voucher URL.
Ensure that you have copied the correct CDC Voucher URL`,
			},
		),
});

/**
 * Extract voucher ID from a CDC voucher URL
 * @param url - Full CDC voucher URL
 * @returns The voucher ID or null if invalid
 */
export function extractVoucherId(url: string): string | null {
	const parsed = cdcVoucherUrlSchema.safeParse({ url });
	if (!parsed.success) {
		return null;
	}

	const voucherUrl = new URL(url);
	const pathParts = voucherUrl.pathname.split("/").filter(Boolean);
	return pathParts[pathParts.length - 1] || null;
}

/**
 * Validate if a string is a valid CDC voucher URL
 */
export function isValidCdcVoucherUrl(url: string): boolean {
	const result = cdcVoucherUrlSchema.safeParse({ url });

	return result.success;
}
