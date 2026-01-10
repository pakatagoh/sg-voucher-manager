import type { RefetchOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { VoucherData } from "@/types/voucher";
import { VoucherDataDisplay } from "./VoucherDataDisplay";

interface VoucherLinkItemProps {
	id: string; // Storage ID
	voucherId: string; // CDC voucher ID
	url: string; // Full URL for display
	voucherData: VoucherData | undefined;
	isLoading: boolean;
	isFetching: boolean;
	error: Error | null;
	refetch: (options?: RefetchOptions) => Promise<unknown>;
	onDelete: (id: string) => void;
	isDeleting: boolean;
}

export function VoucherLinkItem({
	id,
	url,
	voucherData,
	isFetching,
	error,
	refetch,
	onDelete,
	isDeleting,
}: VoucherLinkItemProps) {
	return (
		<li className="bg-background mb-8">
			{voucherData && (
				<VoucherDataDisplay
					data={voucherData}
					url={url}
					onDelete={onDelete}
					isDeleting={isDeleting}
					id={id}
					error={error}
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
