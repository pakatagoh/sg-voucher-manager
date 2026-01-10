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
			{voucherData && (
				<VoucherDataDisplay
					data={voucherData}
					url={url}
					onDelete={onDelete}
					isDeleting={isDeleting}
					id={id}
					error={isError ? error : undefined}
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
