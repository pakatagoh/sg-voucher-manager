import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="min-h-[50vh] flex items-center justify-center px-4">
			<div className="text-center max-w-2xl">
				<h1 className="text-6xl md:text-8xl font-bold uppercase tracking-wider mb-4">
					404
				</h1>
				<p className="text-xl md:text-2xl font-bold uppercase tracking-wide mb-8">
					Page Not Found
				</p>
				<p className="text-base md:text-lg mb-8">
					The page you are looking for does not exist.
				</p>
				<Link
					to="/"
					className="inline-block border-2 border-foreground bg-primary px-6 py-3 font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					Return Home
				</Link>
			</div>
		</div>
	);
}
