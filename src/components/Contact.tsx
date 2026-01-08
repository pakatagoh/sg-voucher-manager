export default function Contact() {
	const links = [
		{
			label: "LinkedIn",
			url: "https://www.linkedin.com/in/pakata-goh/",
			description: "Let's connect",
		},
		{
			label: "GitHub",
			url: "https://github.com/pakatagoh/manage-cdc",
			description: "Open issues or submit PRs",
		},
		{
			label: "X",
			url: "https://x.com/GohPakata",
			description: "Connect on X",
		},
		{
			label: "Website",
			url: "https://pakatagoh.com/",
			description: "Personal site",
		},
	];

	return (
		<footer className="mt-8 border-t-4 border-foreground bg-background pt-12 pb-8">
			<div className="mx-auto max-w-7xl px-4 md:px-6">
				<h2 className="mb-8 text-2xl md:text-3xl">Contact</h2>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{links.map((link) => (
						<a
							key={link.label}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="group relative border-2 border-foreground bg-card p-6 transition-all hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						>
							<div className="flex flex-col">
								<span className="mb-2 text-lg font-bold uppercase tracking-wider">
									{link.label}
								</span>
								<span className="text-sm opacity-80">{link.description}</span>
							</div>
							<div className="absolute right-4 top-4 h-3 w-3 bg-foreground transition-all group-hover:bg-primary-foreground" />
						</a>
					))}
				</div>

				<div className="mt-12 border-t-2 border-foreground pt-6">
					<div className="flex flex-col items-center gap-2 text-center md:flex-row md:justify-between">
						<p className="text-sm font-bold uppercase tracking-wider">
							SG Voucher Manager
						</p>
						<p className="text-sm uppercase tracking-wider text-muted-foreground">
							A project by Pakata Goh
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
