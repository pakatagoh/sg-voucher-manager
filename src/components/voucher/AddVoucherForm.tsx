import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormEventHandler } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { addVoucherLink } from "@/lib/voucherStorage";
import { getVoucherData } from "@/server/voucher";

export function AddVoucherForm() {
	const queryClient = useQueryClient();
	const formRef = useRef<HTMLFormElement>(null);

	// Mutation for adding a voucher link
	const addLinkMutation = useMutation({
		mutationFn: async (url: string) => {
			// Validate URL format first by calling server function
			// This ensures URL validation happens server-side
			try {
				await getVoucherData({ data: { url } });
			} catch (error) {
				throw new Error("Invalid CDC Voucher URL");
			}

			// If validation passes, store in localStorage
			const result = addVoucherLink(url);
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

	return (
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
		</section>
	);
}
