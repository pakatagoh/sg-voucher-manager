import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useVoucherData } from "@/hooks/useVoucherData";
import { VoucherDataDisplay } from "./VoucherDataDisplay";

interface VoucherLinkItemProps {
	id: string; // Storage ID
	voucherId: string; // CDC voucher ID
	url: string; // Full URL for display
	onDelete: (id: string) => void;
	isDeleting: boolean;
}

export function VoucherLinkItem({
	id,
	voucherId,
	url,
	onDelete,
	isDeleting,
}: VoucherLinkItemProps) {
	const {
		data: voucherData,
		refetch,
		isFetching,
		isError,
		error,
	} = useVoucherData(voucherId);

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
