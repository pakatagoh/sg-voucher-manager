import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { extractVoucherId, isValidCdcVoucherUrl } from "@/lib/cdcVoucherSchema";
import {
	addVoucherLink,
	deleteVoucherLink,
	getVoucherLinks,
	type VoucherLink,
} from "@/lib/voucherStorage";
import { getVoucherData } from "@/server/voucher";
import type { VoucherData } from "@/types/voucher";

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
				throw new Error(
					"Invalid CDC Voucher link. The link must begin with https://voucher.redeem.gov.sg",
				);
			}

			// 2. Extract voucher ID
			const voucherId = extractVoucherId(url);
			if (!voucherId) {
				throw new Error("Could not extract voucher ID from URL");
			}

			// 3. Fetch voucher data (validates + pre-caches)
			let voucherData: VoucherData;
			try {
				voucherData = (await getVoucherData({
					data: { id: voucherId },
				})) as VoucherData;
			} catch {
				throw new Error("Invalid voucher or unable to retrieve voucher data");
			}

			// 4. Save to localStorage
			const result = addVoucherLink(url, voucherId);
			if (!result.success) {
				throw new Error(result.message);
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
		},
	});

	// Mutation for deleting a voucher link
	const deleteLink = useMutation({
		mutationFn: async (id: string) => {
			// Find the link to get voucherId before deletion
			const link = links.find((l) => l.id === id);
			if (!link) {
				throw new Error("Link not found");
			}

			// Delete from localStorage
			const result = deleteVoucherLink(id);
			if (!result.success) {
				throw new Error(result.message);
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
