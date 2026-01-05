// Client-side localStorage management for voucher links

const STORAGE_KEY = "voucher-links";

export interface VoucherLink {
	id: string;
	url: string;
	createdAt: string;
}

/**
 * Get all voucher links from localStorage
 */
export function getVoucherLinks(): VoucherLink[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored) as VoucherLink[];
	} catch (error) {
		console.error("Error reading voucher links from localStorage:", error);
		return [];
	}
}

/**
 * Add a new voucher link to localStorage
 */
export function addVoucherLink(url: string): {
	success: boolean;
	message: string;
} {
	try {
		const links = getVoucherLinks();

		// Check if URL already exists
		if (links.some((link) => link.url === url)) {
			return { success: false, message: "Link already exists" };
		}

		// Generate a simple ID (timestamp + random string)
		const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

		const newLink: VoucherLink = {
			id,
			url,
			createdAt: new Date().toISOString(),
		};

		links.push(newLink);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(links));

		return { success: true, message: "Link added successfully" };
	} catch (error) {
		console.error("Error adding voucher link to localStorage:", error);
		return { success: false, message: "Failed to add link" };
	}
}

/**
 * Delete a voucher link from localStorage by ID
 */
export function deleteVoucherLink(id: string): {
	success: boolean;
	message: string;
} {
	try {
		const links = getVoucherLinks();
		const filteredLinks = links.filter((link) => link.id !== id);

		if (filteredLinks.length === links.length) {
			return { success: false, message: "Link not found" };
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLinks));
		return { success: true, message: "Link deleted successfully" };
	} catch (error) {
		console.error("Error deleting voucher link from localStorage:", error);
		return { success: false, message: "Failed to delete link" };
	}
}
