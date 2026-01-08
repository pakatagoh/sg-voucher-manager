import type { FormEventHandler } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useVoucherLinks } from "@/hooks/useVoucherLinks";

export function AddVoucherForm() {
	const formRef = useRef<HTMLFormElement>(null);
	const { addLink } = useVoucherLinks();

	const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
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
					disabled={addLink.isPending}
				/>
				<Button
					type="submit"
					variant="default"
					disabled={addLink.isPending}
					className="md:w-auto"
					aria-label={addLink.isPending ? "Adding voucher" : "Add voucher"}
				>
					{addLink.isPending ? <Spinner /> : "Add"}
				</Button>
			</form>

			{addLink.isError && (
				<div className="border-2 border-destructive bg-muted p-4 mt-4">
					<p className="font-bold uppercase text-sm mb-1">Error</p>
					<p className="text-sm">{addLink.error.message}</p>
				</div>
			)}
		</section>
	);
}
