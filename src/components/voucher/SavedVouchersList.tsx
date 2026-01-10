import { useQueries } from "@tanstack/react-query";
import * as Sentry from "@sentry/tanstackstart-react";
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

	// Reverse links once for display order (newest first)
	const reversedLinks = [...links].reverse();

	// Fetch voucher data for all saved links in display order
	const voucherQueries = useQueries({
		queries: reversedLinks.map((link) => ({
			queryKey: ["voucherData", link.voucherId],
			queryFn: async () => {
				try {
					const result = await getVoucherData({ data: { id: link.voucherId } });
					return result as VoucherData;
				} catch (error) {
					Sentry.captureException(error);
					throw error;
				}
			},
			staleTime: 0,
			retry: false,
			retryOnMount: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
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
			) : reversedLinks.length > 0 ? (
				<ul>
					{reversedLinks.map((link, index) => {
						const query = voucherQueries[index];

						return (
							<VoucherLinkItem
								key={link.id}
								id={link.id}
								voucherId={link.voucherId}
								url={link.url}
								voucherData={query.data}
								isLoading={query.isLoading}
								isFetching={query.isFetching}
								error={query.error}
								refetch={query.refetch}
								onDelete={handleDelete}
								isDeleting={deleteLink.isPending}
							/>
						);
					})}
				</ul>
			) : (
				<div className="border-l-4 border-foreground bg-muted/50 p-6">
					<p className="text-sm text-muted-foreground">
						No saved vouchers yet. Add a CDC or Climate voucher link above to
						get started.
					</p>
				</div>
			)}
		</section>
	);
}
