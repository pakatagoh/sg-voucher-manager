import * as Sentry from "@sentry/tanstackstart-react";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { captureEvent } from "@/lib/posthog-client";
import type { VoucherLink } from "@/lib/voucherStorage";

interface VoucherEmptyDataDisplayProps {
	link: VoucherLink;
	onDelete: (id: string) => void;
	isDeleting: boolean;
	deleteError: Error | null;
}

export function VoucherEmptyDataDisplay({
	link,
	onDelete,
	isDeleting,
	deleteError,
}: VoucherEmptyDataDisplayProps) {
	// Enhanced URL safety check - defense-in-depth
	// Validate URL at render time to prevent any bypassed URLs from being clickable
	const isValidUrl = link.url.startsWith("https://voucher.redeem.gov.sg/");
	const safeUrl = isValidUrl ? link.url : "#";

	const handleDelete = () => {
		captureEvent("voucher_delete_click", {
			display_type: "empty_data_display",
		});
		onDelete(link.id);
	};

	const handleLinkClick = () => {
		captureEvent("voucher_link_click", {
			display_type: "empty_data_display",
		});
	};

	// Track empty data display event
	useEffect(() => {
		captureEvent("voucher_empty_data_displayed");
	}, []);

	useEffect(() => {
		if (!isValidUrl) {
			Sentry.captureException(new Error(`invalid URL rendered: ${link.url}`));
		}
	}, [isValidUrl, link.url]);

	return (
		<div className="border-2 border-foreground bg-muted p-4 mt-4">
			{/* Header with message and delete button */}
			<div className="flex justify-between items-start gap-4 mb-3">
				<p className="text-sm font-medium">
					Unable to retrieve data for your voucher. Click refresh to retry.
				</p>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={handleDelete}
					disabled={isDeleting}
					className="border-2 border-foreground bg-background hover:bg-background hover:border-destructive focus-visible:ring-destructive flex-shrink-0"
					aria-label={isDeleting ? "Deleting voucher" : "Delete voucher"}
					title={isDeleting ? "Deleting..." : "Delete voucher"}
				>
					<X className="size-4 text-destructive" strokeWidth={3} />
				</Button>
			</div>

			{/* Voucher URL */}
			{isValidUrl ? (
				<a
					onClick={handleLinkClick}
					href={safeUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm font-medium text-primary underline hover:text-primary/80 transition-colors break-all block mb-2"
				>
					{link.url}
				</a>
			) : (
				<span
					className="text-sm font-medium text-destructive line-through break-all block mb-2 cursor-not-allowed"
					title="Invalid voucher URL"
				>
					{link.url} (Invalid URL)
				</span>
			)}

			{/* Delete error display */}
			{deleteError && (
				<div className="border-l-4 border-destructive pl-4 mt-4">
					<p className="text-sm text-destructive mb-1">
						<span className="font-bold uppercase text-xs">Delete Error:</span>{" "}
						{deleteError.message}
					</p>
					<p className="text-xs">Try deleting again.</p>
				</div>
			)}
		</div>
	);
}
