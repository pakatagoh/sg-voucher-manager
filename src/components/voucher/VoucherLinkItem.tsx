import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useVoucherData } from "@/hooks/useVoucherData";
import { captureEvent } from "@/lib/posthog-client";
import type { VoucherLink } from "@/lib/voucherStorage";
import { VoucherDataDisplay } from "./VoucherDataDisplay";
import { VoucherEmptyDataDisplay } from "./VoucherEmptyDatalDisplay";

interface VoucherLinkItemProps {
	link: VoucherLink;
	onDelete: (id: string) => void;
	isDeleting: boolean;
	deleteError: Error | null;
}

export function VoucherLinkItem({
	link,
	onDelete,
	isDeleting,
	deleteError,
}: VoucherLinkItemProps) {
	const {
		data: voucherData,
		error,
		refetch,
		isLoading,
		isFetching,
	} = useVoucherData(link.voucherId);

	const isShowSpinner = useDelayedLoading(isLoading);

	const handleRefresh = () => {
		captureEvent("refresh_click", {
			display_type: voucherData ? "full_data_display" : "empty_data_display",
		});
		refetch();
	};

	// Emit PostHog event when voucher is successfully rendered
	const voucherId = voucherData?.data.id;
	useEffect(() => {
		if (voucherId) {
			captureEvent("voucher_rendered");
		}
	}, [voucherId]);

	// Loading skeleton with Bauhaus aesthetic
	if (isShowSpinner) {
		return (
			<li className="bg-background mb-8 last:mb-0">
				<div className="border-2 border-foreground bg-muted p-4 mt-4 h-[268px] animate-pulse">
					{/* Header area with title and delete button */}
					<div className="flex justify-between gap-4 mb-3">
						<div className="h-6 bg-foreground/20 w-3/4" />
						<div className="h-8 w-8 bg-foreground/20" />
					</div>

					{/* Description */}
					<div className="h-4 bg-foreground/20 w-full mb-2" />
					<div className="h-4 bg-foreground/20 w-2/3 mb-2" />

					{/* URL */}
					<div className="h-4 bg-foreground/20 w-full mb-2" />

					{/* Valid until */}
					<div className="h-4 bg-foreground/20 w-1/2 mb-4" />

					{/* Denomination breakdown */}
					<div className="border-l-4 border-foreground pl-4 mb-4">
						<div className="h-4 bg-foreground/20 w-24 mb-1" />
						<div className="h-4 bg-foreground/20 w-48 mb-1" />
						<div className="h-6 bg-foreground/20 w-20" />
					</div>
				</div>

				{/* Refresh button skeleton */}
				<div className="mt-2">
					<div className="h-9 border-2 border-primary bg-primary/10 w-full animate-pulse" />
				</div>
			</li>
		);
	}

	return (
		<li className="bg-background mb-8 last:mb-0">
			{voucherData ? (
				<VoucherDataDisplay
					link={link}
					data={voucherData}
					onDelete={onDelete}
					isDeleting={isDeleting}
					queryError={error}
					deleteError={deleteError}
				/>
			) : !isLoading && !voucherData ? (
				<VoucherEmptyDataDisplay
					link={link}
					onDelete={onDelete}
					isDeleting={isDeleting}
					deleteError={deleteError}
				/>
			) : null}

			{/* Refresh button at bottom spanning full width */}
			{!isLoading && (
				<div className="mt-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isFetching}
						className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
						aria-label={
							isFetching ? "Refreshing voucher data" : "Refresh voucher data"
						}
					>
						{isFetching ? <Spinner /> : "Refresh"}
					</Button>
				</div>
			)}
		</li>
	);
}
