export default function Header() {
	return (
		<header className="border-b-4 border-foreground bg-background">
			<div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
				<h1 className="text-2xl font-bold uppercase tracking-wider md:text-3xl">
					SG Voucher
					<span className="ml-2 inline-block bg-primary px-3 py-1 text-primary-foreground">
						Manager
					</span>
				</h1>
			</div>
		</header>
	);
}
