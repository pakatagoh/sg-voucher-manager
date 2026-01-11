import type { FormEventHandler } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useVoucherLinks } from "@/hooks/useVoucherLinks";
import { posthog } from "@/lib/posthog-client";

export function AddVoucherForm() {
	const formRef = useRef<HTMLFormElement>(null);
	const { addLink } = useVoucherLinks();

	const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		posthog.capture("submit_voucher_form");
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const url = formData.get("url") as string;

		if (!url) return;

		addLink.mutate(url, {
			onSuccess: () => {
				// Clear the form on success
				formRef.current?.reset();
			},
		});
	};

	return (
		<div className="mb-8">
			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className="flex flex-wrap items-center gap-2"
			>
				<label htmlFor="voucher-url" className="sr-only">
					Voucher Link
				</label>
				{/** biome-ignore lint/correctness/useUniqueElementIds: id for label */}
				<Input
					id="voucher-url"
					type="text"
					name="url"
					placeholder="Enter CDC or Climate voucher link"
					disabled={addLink.isPending}
					className="h-11 w-full md:flex-1"
				/>
				<Button
					type="submit"
					variant="default"
					disabled={addLink.isPending}
					className="h-11 px-6 w-full md:w-auto"
					aria-label={addLink.isPending ? "Adding voucher" : "Add voucher"}
				>
					{addLink.isPending ? <Spinner /> : "Add"}
				</Button>
			</form>

			{addLink.isError && (
				<div className="border-2 border-destructive bg-muted p-3 mt-2">
					<p className="font-bold uppercase text-xs tracking-wide mb-1">
						Error
					</p>
					<p className="text-sm">{addLink.error.message}</p>
				</div>
			)}
		</div>
	);
}
