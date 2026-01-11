// Client-side localStorage management for voucher links
import * as Sentry from "@sentry/tanstackstart-react";
import { createClientOnlyFn } from "@tanstack/react-start";

const STORAGE_KEY = "voucher-links";

export interface VoucherLink {
	id: string; // Storage ID for this link
	voucherId: string; // CDC voucher ID extracted from URL
	url: string; // Full CDC voucher URL
	createdAt: string;
}

/**
 * Get all voucher links from localStorage
 */
export const getVoucherLinks = createClientOnlyFn((): VoucherLink[] => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored) as VoucherLink[];
	} catch (error) {
		Sentry.captureException(error);
		return [];
	}
});

/**
 * Add a new voucher link to localStorage
 */
export const addVoucherLink = createClientOnlyFn(
	(
		url: string,
		voucherId: string,
	): {
		success: boolean;
		message: string;
		exceptionType: string;
	} => {
		try {
			const links = getVoucherLinks();

			// Check if voucher ID already exists
			if (links.some((link) => link.voucherId === voucherId)) {
				return {
					success: false,
					message: "Voucher already exists",
					exceptionType: "duplicate_voucher",
				};
			}

			// Generate a simple storage ID (timestamp + random string)
			const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

			const newLink: VoucherLink = {
				id,
				voucherId,
				url,
				createdAt: new Date().toISOString(),
			};

			links.push(newLink);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(links));

			return {
				success: true,
				message: "Voucher added successfully",
				exceptionType: "",
			};
		} catch (error) {
			Sentry.captureException(error);
			return {
				success: false,
				message: "Failed to add voucher",
				exceptionType: "storage_error",
			};
		}
	},
);

/**
 * Delete a voucher link from localStorage by storage ID
 */
export const deleteVoucherLink = createClientOnlyFn(
	(
		id: string,
	): {
		success: boolean;
		message: string;
		exceptionType: string;
	} => {
		try {
			const links = getVoucherLinks();
			const filteredLinks = links.filter((link) => link.id !== id);

			if (filteredLinks.length === links.length) {
				return {
					success: false,
					message: "Voucher not found",
					exceptionType: "voucher_not_found",
				};
			}

			localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLinks));
			return {
				success: true,
				message: "Voucher deleted successfully",
				exceptionType: "",
			};
		} catch (error) {
			Sentry.captureException(error);
			return {
				success: false,
				message: "Failed to delete voucher",
				exceptionType: "storage_error",
			};
		}
	},
);
