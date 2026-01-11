import { Link } from "@tanstack/react-router";

export default function Header() {
	return (
		<header className="mx-auto max-w-7xl px-4 py-4 md:px-6">
			<div className="border-b-4 border-foreground bg-background pb-4">
				<Link to="/" className="inline-block">
					<div className="text-2xl font-bold uppercase tracking-wider md:text-3xl">
						SG Voucher
						<span className="ml-2 inline-block bg-primary px-3 py-1 text-primary-foreground">
							Manager
						</span>
					</div>
				</Link>
			</div>
		</header>
	);
}
