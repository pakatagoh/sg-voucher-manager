// Client-side localStorage management for voucher links
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
		console.error("Error reading voucher links from localStorage:", error);
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
	} => {
		try {
			const links = getVoucherLinks();

			// Check if voucher ID already exists
			if (links.some((link) => link.voucherId === voucherId)) {
				return { success: false, message: "Voucher already exists" };
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

			return { success: true, message: "Voucher added successfully" };
		} catch (error) {
			console.error("Error adding voucher link to localStorage:", error);
			return { success: false, message: "Failed to add voucher" };
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
	} => {
		try {
			const links = getVoucherLinks();
			const filteredLinks = links.filter((link) => link.id !== id);

			if (filteredLinks.length === links.length) {
				return { success: false, message: "Voucher not found" };
			}

			localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLinks));
			return { success: true, message: "Voucher deleted successfully" };
		} catch (error) {
			console.error("Error deleting voucher link from localStorage:", error);
			return { success: false, message: "Failed to delete voucher" };
		}
	},
);
