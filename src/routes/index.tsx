import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { FormEventHandler } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	addVoucherLink,
	deleteVoucherLink,
	getVoucherData,
	getVoucherLinks,
} from "@/server/voucherStorage";

export const Route = createFileRoute("/")({ component: App });

type VoucherType = "heartland" | "supermarket";

interface Voucher {
	id: string;
	state: string;
	voucher_value: number;
	type: VoucherType;
	merchant_name: string | null;
	last_redeemed_timestamp: string | null;
}

interface VoucherData {
	campaign: {
		name: string;
		description: string;
		validity_end: string;
		default_vouchers: Array<{
			value: number;
			quantity: number;
			type: VoucherType;
		}>;
	};
	data: {
		vouchers: Voucher[];
	};
}

interface DenominationBreakdown {
	[key: number]: {
		total: number;
		unused: number;
		redeemed: number;
	};
}

function processVoucherData(data: VoucherData) {
	const { campaign, data: voucherData } = data;

	// Group vouchers by type
	const heartlandVouchers = voucherData.vouchers.filter(
		(v) => v.type === "heartland",
	);
	const supermarketVouchers = voucherData.vouchers.filter(
		(v) => v.type === "supermarket",
	);

	// Process denomination breakdown
	const processBreakdown = (vouchers: Voucher[]): DenominationBreakdown => {
		const breakdown: DenominationBreakdown = {};

		for (const voucher of vouchers) {
			const value = voucher.voucher_value;
			if (!breakdown[value]) {
				breakdown[value] = { total: 0, unused: 0, redeemed: 0 };
			}

			breakdown[value].total++;
			if (voucher.state.trim() === "unused") {
				breakdown[value].unused++;
			} else if (voucher.state.trim() === "redeemed") {
				breakdown[value].redeemed++;
			}
		}

		return breakdown;
	};

	return {
		name: campaign.name,
		description: campaign.description,
		validityEnd: new Date(campaign.validity_end).toLocaleDateString(),
		heartlandBreakdown: processBreakdown(heartlandVouchers),
		supermarketBreakdown: processBreakdown(supermarketVouchers),
	};
}

interface VoucherDataDisplayProps {
	data: VoucherData;
	url: string;
	onDelete: (id: string) => void;
	isDeleting: boolean;
	id: string;
}

function VoucherDataDisplay({
	data,
	url,
	onDelete,
	isDeleting,
	id,
}: VoucherDataDisplayProps) {
	const processedData = processVoucherData(data);

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
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm font-medium text-primary underline hover:text-primary/80 transition-colors break-all block mb-2"
			>
				{url}
			</a>
			<p className="text-sm mb-4 font-bold">
				Valid until: {processedData.validityEnd}
			</p>

			{renderBreakdownSummary(processedData.heartlandBreakdown, "Heartland")}
			{renderBreakdownSummary(
				processedData.supermarketBreakdown,
				"Supermarket",
			)}
		</div>
	);
}

interface VoucherLinkItemProps {
	id: string;
	url: string;
	onDelete: (id: string) => void;
	isDeleting: boolean;
	autoFetch?: boolean;
}

function VoucherLinkItem({
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

function App() {
	const queryClient = useQueryClient();
	const formRef = useRef<HTMLFormElement>(null);

	// Query for fetching voucher links
	const { data: links = [] } = useQuery({
		queryKey: ["voucherLinks"],
		queryFn: async () => {
			const data = await getVoucherLinks();
			return data;
		},
	});

	// Mutation for adding a voucher link
	const addLinkMutation = useMutation({
		mutationFn: async (url: string) => {
			const result = await addVoucherLink({ data: { url } });
			if (!result.success) {
				throw new Error(result.message);
			}
			return result;
		},
		onSuccess: () => {
			// Clear the form input
			formRef.current?.reset();
			// Invalidate and refetch voucher links
			queryClient.invalidateQueries({ queryKey: ["voucherLinks"] });
		},
		onError: (error: Error) => {
			console.error("Error adding link:", error.message);
		},
	});

	// Mutation for deleting a voucher link
	const deleteLinkMutation = useMutation({
		mutationFn: async (id: string) => {
			const result = await deleteVoucherLink({ data: { id } });
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

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const url = formData.get("url") as string;

		if (!url) return;

		// Reset error state before new submission
		addLinkMutation.reset();

		// Trigger the mutation
		addLinkMutation.mutate(url);
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteLinkMutation.mutateAsync(id);
		} catch {
			// Error is already handled in mutation's onError
		}
	};

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
			<section className="mb-8">
				<h2 className="mb-4 text-xl md:text-2xl">Add Voucher</h2>

				<form
					ref={formRef}
					onSubmit={handleSubmit}
					className="flex flex-col md:flex-row gap-2"
				>
					<Input
						type="text"
						name="url"
						placeholder="Enter CDC voucher URL"
						className="flex-1"
					/>
					<Button
						type="submit"
						variant="default"
						disabled={addLinkMutation.isPending}
						className="md:w-auto"
						aria-label={
							addLinkMutation.isPending ? "Adding voucher" : "Add voucher"
						}
					>
						{addLinkMutation.isPending ? <Spinner /> : "Add Voucher"}
					</Button>
				</form>

				{addLinkMutation.isError && (
					<div className="border-2 border-destructive bg-muted p-4 mt-4">
						<p className="font-bold uppercase text-sm mb-1">Error</p>
						<p className="text-sm">{addLinkMutation.error.message}</p>
					</div>
				)}

				{deleteLinkMutation.isError && (
					<div className="border-2 border-destructive bg-muted p-4 mt-4">
						<p className="font-bold uppercase text-sm mb-1">Error</p>
						<p className="text-sm">{deleteLinkMutation.error.message}</p>
					</div>
				)}
			</section>

			<section>
				<h2 className="mb-6 border-b-4 border-foreground pb-2">
					Saved Vouchers
				</h2>
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
							No saved vouchers yet. Add a CDC voucher link above to get
							started.
						</p>
					</div>
				)}
			</section>
		</div>
	);
}
