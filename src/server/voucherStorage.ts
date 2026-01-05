import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { decrypt, encrypt } from "./encryption";

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

// Zod schema to validate voucher link ID
const voucherLinkIdSchema = z.object({
	id: z.string().uuid(),
});

// In-memory storage for voucher links
// ID is used as the primary key (UUID), URLs are stored encrypted
// TODO: Replace with database + user authentication
interface VoucherLink {
	id: string;
	encryptedUrl: string;
	createdAt: Date;
}

const voucherLinks = new Map<string, VoucherLink>();

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

// Server function to add a voucher link
export const addVoucherLink = createServerFn({ method: "POST" })
	.inputValidator(cdcVoucherUrlSchema)
	.handler(async ({ data }) => {
		// Check if URL already exists (need to check all encrypted URLs)
		for (const link of voucherLinks.values()) {
			try {
				if (decrypt(link.encryptedUrl) === data.url) {
					return { success: false, message: "Link already exists" };
				}
			} catch {
				// Skip invalid encrypted entries
				continue;
			}
		}

		// Encrypt the URL before storing
		const encryptedUrl = encrypt(data.url);
		const id = randomUUID();

		voucherLinks.set(id, {
			id,
			encryptedUrl,
			createdAt: new Date(),
		});

		return { success: true, message: "Link added successfully" };
	});

// Server function to get all voucher links
export const getVoucherLinks = createServerFn({ method: "GET" }).handler(
	async () => {
		// TODO: Filter by user ID once authentication is implemented
		// Decrypt URLs before returning to the client
		const links = Array.from(voucherLinks.values()).map((link) => ({
			id: link.id,
			url: decrypt(link.encryptedUrl),
			createdAt: link.createdAt.toISOString(),
		}));

		return links;
	},
);

// Server function to delete a voucher link
export const deleteVoucherLink = createServerFn({ method: "POST" })
	.inputValidator(voucherLinkIdSchema)
	.handler(async ({ data }) => {
		// TODO: Verify ownership once authentication is implemented
		if (!voucherLinks.has(data.id)) {
			return { success: false, message: "Link not found" };
		}

		voucherLinks.delete(data.id);
		return { success: true, message: "Link deleted successfully" };
	});
