import { Link } from "@tanstack/react-router";

export default function Header() {
	return (
		<header className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
			<div className="border-b-4 border-foreground bg-background pb-4">
				<Link to="/" className="inline-block">
					<div className="text-xl md:text-3xl font-bold uppercase tracking-wider">
						SG Voucher
						<span className="ml-2 inline-block bg-primary px-2 py-1 md:px-3 md:py-1 text-primary-foreground">
							Manager
						</span>
					</div>
				</Link>
			</div>
		</header>
	);
}
