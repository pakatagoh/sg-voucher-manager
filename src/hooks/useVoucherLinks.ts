import * as Sentry from "@sentry/tanstackstart-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { extractVoucherId, isValidCdcVoucherUrl } from "@/lib/cdcVoucherSchema";
import { posthog } from "@/lib/posthog-client";
import {
	addVoucherLink,
	deleteVoucherLink,
	getVoucherLinks,
	type VoucherLink,
} from "@/lib/voucherStorage";
import { getVoucherData } from "@/server/voucher";
import type { VoucherData } from "@/types/voucher";

/**
 * Custom error class that includes exceptionType for better error categorization
 */
class VoucherError extends Error {
	exceptionType?: string;

	constructor(message: string, exceptionType?: string) {
		super(message);
		this.name = "VoucherError";
		this.exceptionType = exceptionType;
	}
}

export function useVoucherLinks() {
	const queryClient = useQueryClient();

	// Query for fetching voucher links from localStorage
	const {
		data: links = [],
		isLoading,
		error: queryError,
	} = useQuery<VoucherLink[]>({
		queryKey: ["voucherLinks"],
		queryFn: () => getVoucherLinks(),
		staleTime: 0, // Always consider stale
		initialData: () => (typeof window !== "undefined" ? getVoucherLinks() : []), // Only call on client
	});

	// Mutation for adding a new voucher link
	const addLink = useMutation({
		mutationFn: async (url: string) => {
			// 1. Validate URL format
			if (!isValidCdcVoucherUrl(url)) {
				throw new VoucherError(
					"Invalid CDC Voucher link. The link must begin with https://voucher.redeem.gov.sg",
					"invalid_url",
				);
			}

			// 2. Extract voucher ID
			const voucherId = extractVoucherId(url);
			if (!voucherId) {
				throw new VoucherError(
					"Could not extract voucher ID from URL",
					"invalid_voucher_id",
				);
			}

			// 3. Fetch voucher data (validates + pre-caches)
			let voucherData: VoucherData;
			try {
				voucherData = (await getVoucherData({
					data: { id: voucherId },
				})) as VoucherData;
			} catch (error) {
				Sentry.captureException(error);

				// Network error
				throw new VoucherError(
					"Unable to load voucher details. Please try again adding your voucher again.",
					"network_error",
				);
			}

			// 4. Save to localStorage
			const result = addVoucherLink(url, voucherId);
			if (!result.success) {
				throw new VoucherError(result.message, result.exceptionType);
			}

			// 5. Get the newly created link (last one in array)
			const updatedLinks = getVoucherLinks();
			const newLink = updatedLinks[updatedLinks.length - 1];

			return { newLink, voucherData };
		},
		onSuccess: ({ newLink, voucherData }) => {
			// Update voucher links cache optimistically
			queryClient.setQueryData<VoucherLink[]>(["voucherLinks"], (old = []) => [
				...old,
				newLink,
			]);

			// Pre-cache the fetched voucher data
			queryClient.setQueryData(["voucherData", newLink.voucherId], voucherData);

			posthog.capture("voucher_add_success");
		},
		onError: (error: Error) => {
			// Capture error event to PostHog with context
			const errorType =
				error instanceof VoucherError && error.exceptionType
					? error.exceptionType
					: "unknown_error";

			posthog.capture("voucher_add_failed", {
				error_message: error.message,
				error_type: errorType,
			});
		},
	});

	// Mutation for deleting a voucher link
	const deleteLink = useMutation({
		mutationFn: async (id: string) => {
			// Find the link to get voucherId before deletion
			const link = links.find((l) => l.id === id);
			if (!link) {
				throw new VoucherError("Link not found", "link_not_found");
			}

			// Delete from localStorage
			const result = deleteVoucherLink(id);
			if (!result.success) {
				throw new VoucherError(result.message, result.exceptionType);
			}

			return link;
		},
		onSuccess: (deletedLink) => {
			// Update voucher links cache
			queryClient.setQueryData<VoucherLink[]>(["voucherLinks"], (old = []) =>
				old.filter((l) => l.id !== deletedLink.id),
			);

			// CASCADE: Remove related voucher data from cache
			queryClient.removeQueries({
				queryKey: ["voucherData", deletedLink.voucherId],
				exact: true,
			});
			posthog.capture("voucher_delete_success");
		},
		onError: (error: Error) => {
			const errorType =
				error instanceof VoucherError && error.exceptionType
					? error.exceptionType
					: "unknown_error";
			posthog.capture("voucher_delete_failed", {
				error_message: error.message,
				error_type: errorType,
			});
		},
	});

	return {
		links,
		addLink,
		deleteLink,
		isLoading,
		error: queryError,
	};
}
