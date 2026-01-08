import { useQueries } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useVoucherLinks } from "@/hooks/useVoucherLinks";
import { getVoucherData } from "@/server/voucher";
import type { VoucherData } from "@/types/voucher";
import { VoucherLinkItem } from "./VoucherLinkItem";

export function SavedVouchersList() {
	const { links, deleteLink } = useVoucherLinks();

	const handleDelete = (id: string) => {
		deleteLink.mutate(id);
	};

	// Check if any vouchers are in initial loading state (no data yet)
	const voucherQueries = useQueries({
		queries: links.map((link) => ({
			queryKey: ["voucherData", link.voucherId],
			queryFn: async () => {
				const result = await getVoucherData({ data: { id: link.voucherId } });
				return result as VoucherData;
			},
			staleTime: 0,
		})),
	});

	const isInitialLoad = voucherQueries.some(
		(query) => query.isLoading && !query.data,
	);

	return (
		<section>
			<h2 className="mb-6 border-b-4 border-foreground pb-2">Saved Vouchers</h2>

			{deleteLink.isError && (
				<div className="border-2 border-destructive bg-muted p-4 mb-4">
					<p className="font-bold uppercase text-sm mb-1">Error</p>
					<p className="text-sm">{deleteLink.error.message}</p>
				</div>
			)}

			{isInitialLoad ? (
				<div className="flex justify-center items-center p-8">
					<Spinner />
				</div>
			) : links.length > 0 ? (
				<ul>
					{links.map((link) => (
						<VoucherLinkItem
							key={link.id}
							id={link.id}
							voucherId={link.voucherId}
							url={link.url}
							onDelete={handleDelete}
							isDeleting={deleteLink.isPending}
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
