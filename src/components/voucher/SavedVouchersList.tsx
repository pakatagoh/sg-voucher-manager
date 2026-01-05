import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteVoucherLink,
	getVoucherLinks,
	type VoucherLink,
} from "@/lib/voucherStorage";
import { VoucherLinkItem } from "./VoucherLinkItem";

export function SavedVouchersList() {
	const queryClient = useQueryClient();

	// Query for fetching voucher links from localStorage
	const { data: links = [] } = useQuery<VoucherLink[]>({
		queryKey: ["voucherLinks"],
		queryFn: () => {
			// Client-side only - read from localStorage
			return getVoucherLinks();
		},
	});

	// Mutation for deleting a voucher link
	const deleteLinkMutation = useMutation({
		mutationFn: async (id: string) => {
			const result = deleteVoucherLink(id);
			if (!result.success) {
				throw new Error(result.message);
			}
			return result;
		},
		onSuccess: () => {
			// Invalidate and refetch voucher links
			queryClient.invalidateQueries({ queryKey: ["voucherLinks"] });
		},
		onError: (error: Error) => {
			console.error("Error deleting link:", error.message);
		},
	});

	const handleDelete = async (id: string) => {
		try {
			await deleteLinkMutation.mutateAsync(id);
		} catch {
			// Error is already handled in mutation's onError
		}
	};

	return (
		<section>
			<h2 className="mb-6 border-b-4 border-foreground pb-2">Saved Vouchers</h2>

			{deleteLinkMutation.isError && (
				<div className="border-2 border-destructive bg-muted p-4 mb-4">
					<p className="font-bold uppercase text-sm mb-1">Error</p>
					<p className="text-sm">{deleteLinkMutation.error.message}</p>
				</div>
			)}

			{links.length > 0 ? (
				<ul>
					{links.map((link) => (
						<VoucherLinkItem
							key={link.id}
							id={link.id}
							url={link.url}
							onDelete={handleDelete}
							isDeleting={deleteLinkMutation.isPending}
							autoFetch={true}
						/>
					))}
				</ul>
			) : (
				<div className="border-l-4 border-foreground bg-muted/50 p-6">
					<p className="text-sm text-muted-foreground">
						No saved vouchers yet. Add a CDC voucher link above to get started.
					</p>
				</div>
			)}
		</section>
	);
}
