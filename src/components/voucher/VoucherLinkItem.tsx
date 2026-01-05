import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getVoucherData } from "@/server/voucher";
import type { VoucherData } from "@/types/voucher";
import { VoucherDataDisplay } from "./VoucherDataDisplay";

interface VoucherLinkItemProps {
	id: string;
	url: string;
	onDelete: (id: string) => void;
	isDeleting: boolean;
	autoFetch?: boolean;
}

export function VoucherLinkItem({
	id,
	url,
	onDelete,
	isDeleting,
	autoFetch = false,
}: VoucherLinkItemProps) {
	// Query for fetching voucher data for this specific URL
	const {
		data: voucherData,
		refetch,
		isFetching,
		isError,
		error,
	} = useQuery<VoucherData>({
		queryKey: ["voucherData", url],
		queryFn: async () => {
			const result = await getVoucherData({ data: { url } });
			return result as VoucherData;
		},
		enabled: autoFetch, // Fetch automatically if autoFetch is true
	});

	return (
		<li className="bg-background mb-8">
			{isError && (
				<div className="border-2 border-destructive bg-muted p-4 mb-4">
					<p className="font-bold uppercase text-sm mb-1">Error</p>
					<p className="text-sm">{(error as Error).message}</p>
				</div>
			)}

			{voucherData && (
				<VoucherDataDisplay
					data={voucherData}
					url={url}
					onDelete={onDelete}
					isDeleting={isDeleting}
					id={id}
				/>
			)}

			{/* Refresh button at bottom spanning full width */}
			<div className="mt-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => refetch()}
					disabled={isFetching}
					className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
					aria-label={
						isFetching ? "Refreshing voucher data" : "Refresh voucher data"
					}
				>
					{isFetching ? <Spinner /> : "Refresh"}
				</Button>
			</div>
		</li>
	);
}
