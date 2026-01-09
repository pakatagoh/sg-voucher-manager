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
	];

	return (
		<footer className="mt-8 bg-background pt-12 pb-8">
			<div className="mx-auto max-w-7xl px-4 md:px-6">
				<div className="border-t-4 border-foreground pt-12">
					<h2 className="mb-6 text-2xl md:text-3xl">Contact</h2>

					<div className="flex flex-wrap gap-4">
						{links.map((link) => (
							<a
								key={link.label}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-center gap-2 border-2 border-foreground px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							>
								<span className="text-sm font-bold uppercase tracking-wide">
									{link.label}
								</span>
								<span className="h-2 w-2 bg-foreground transition-all group-hover:bg-primary-foreground" />
							</a>
						))}
					</div>

					<div className="mt-12 border-t-2 border-foreground pt-6">
						<p className="text-sm font-bold uppercase tracking-wider">
							SG Voucher Manager
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
