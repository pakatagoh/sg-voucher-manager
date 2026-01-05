import { createFileRoute } from "@tanstack/react-router";
import { AddVoucherForm } from "@/components/voucher/AddVoucherForm";
import { SavedVouchersList } from "@/components/voucher/SavedVouchersList";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
			<AddVoucherForm />
			<SavedVouchersList />
		</div>
	);
}
