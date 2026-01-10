import { TicketMinus } from "lucide-react";
import { useVoucherLinks } from "@/hooks/useVoucherLinks";
import { VoucherLinkItem } from "./VoucherLinkItem";

export function SavedVouchersList() {
	const { links, deleteLink } = useVoucherLinks();

	const handleDelete = (id: string) => {
		deleteLink.mutate(id);
	};

	// Reverse links once for display order (newest first)
	const reversedLinks = [...links].reverse();

	return (
		<>
			{reversedLinks.length > 0 ? (
				<ul>
					{reversedLinks.map((link) => {
						return (
							<VoucherLinkItem
								key={link.id}
								link={link}
								onDelete={handleDelete}
								isDeleting={deleteLink.isPending}
								deleteError={deleteLink.error}
							/>
						);
					})}
				</ul>
			) : (
				<div className="bg-muted p-8 min-h-52 flex flex-col items-center justify-center text-center">
					<TicketMinus
						className="size-12 text-muted-foreground mb-4"
						strokeWidth={1}
					/>
					<p className="text-sm text-muted-foreground">
						No saved vouchers yet. Add a CDC or Climate voucher link above to
						get started.
					</p>
				</div>
			)}
		</>
	);
}
