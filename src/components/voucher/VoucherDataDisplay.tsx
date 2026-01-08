import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processVoucherData } from "@/lib/voucherUtils";
import type { DenominationBreakdown, VoucherData } from "@/types/voucher";

interface VoucherDataDisplayProps {
	data: VoucherData;
	url: string;
	onDelete: (id: string) => void;
	isDeleting: boolean;
	id: string;
}

export function VoucherDataDisplay({
	data,
	url,
	onDelete,
	isDeleting,
	id,
}: VoucherDataDisplayProps) {
	const processedData = processVoucherData(data);

	// Enhanced URL safety check - defense-in-depth
	// Validate URL at render time to prevent any bypassed URLs from being clickable
	const isValidUrl = url.startsWith("https://voucher.redeem.gov.sg/");
	const safeUrl = isValidUrl ? url : "#";

	const renderBreakdownSummary = (
		breakdown: DenominationBreakdown,
		title: string,
	) => {
		const denominations = Object.keys(breakdown)
			.map(Number)
			.sort((a, b) => a - b);

		if (denominations.length === 0) {
			return null;
		}

		// Calculate total unused value
		let totalUnusedValue = 0;
		for (const denom of denominations) {
			totalUnusedValue += denom * breakdown[denom].unused;
		}

		// Build denomination summary string
		const denominationSummary = denominations
			.map((denom) => `${breakdown[denom].unused}x $${denom.toFixed(2)}`)
			.join(", ");

		return (
			<div className="border-l-4 border-foreground pl-4 mb-4">
				<p className="text-sm font-bold uppercase tracking-wide mb-1">
					{title}
				</p>
				<p className="text-sm mb-1">{denominationSummary}</p>
				<p className="text-lg font-bold">${totalUnusedValue.toFixed(2)}</p>
			</div>
		);
	};

	return (
		<div className="border-2 border-foreground bg-muted p-4 mt-4">
			<div className="flex justify-between gap-4 mb-3">
				<h3 className="flex-1">{processedData.name}</h3>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={() => onDelete(id)}
					disabled={isDeleting}
					className="border-2 border-foreground bg-background hover:bg-background hover:border-destructive"
					aria-label={isDeleting ? "Deleting voucher" : "Delete voucher"}
					title={isDeleting ? "Deleting..." : "Delete voucher"}
				>
					<X className="size-4 text-destructive" strokeWidth={3} />
				</Button>
			</div>
			<p className="text-sm mb-2">{processedData.description}</p>
			{isValidUrl ? (
				<a
					href={safeUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm font-medium text-primary underline hover:text-primary/80 transition-colors break-all block mb-2"
				>
					{url}
				</a>
			) : (
				<span
					className="text-sm font-medium text-destructive line-through break-all block mb-2 cursor-not-allowed"
					title="Invalid voucher URL"
				>
					{url} (Invalid URL)
				</span>
			)}
			<p className="text-sm mb-4 font-bold">
				Valid until: {processedData.validityEnd}
			</p>

			{renderBreakdownSummary(processedData.heartlandBreakdown, "Heartland")}
			{renderBreakdownSummary(
				processedData.supermarketBreakdown,
				"Supermarket",
			)}
			{renderBreakdownSummary(processedData.climateBreakdown, "Climate")}
		</div>
	);
}
