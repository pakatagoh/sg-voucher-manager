export default function PrivacyDisclaimer() {
	return (
		<section className="mb-6 border-l-4 border-foreground bg-muted px-4 py-3">
			<h3 className="mb-2 text-sm font-bold uppercase tracking-wide md:text-base">
				Privacy & Disclaimer
			</h3>
			<div className="space-y-1">
				<p className="text-xs md:text-sm">
					Your information never leaves your device. We just help you retrieve
					your voucher details - we don't save or track anything.
				</p>
				<p className="text-xs font-bold uppercase tracking-wide md:text-sm">
					Not affiliated with the Singapore Government.
				</p>
			</div>
		</section>
	);
}
