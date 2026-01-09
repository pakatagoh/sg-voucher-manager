import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { NotFound } from "@/components/NotFound";
import Header from "../components/Header";
import Footer from "../components/Footer";
import appCss from "../styles.css?url";

// Initialize Sentry on server side before anything else
import "../server/sentry.js";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => {
		const baseUrl =
			import.meta.env.MODE === "production"
				? "https://sg-voucher-manager.vercel.app"
				: "http://localhost:3000";

		return {
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					title: "SG Voucher Manager",
				},
				// SEO Meta Tags
				{
					name: "description",
					content: "Manage your Singapore vouchers easily",
				},
				// Open Graph / Facebook
				{
					property: "og:type",
					content: "website",
				},
				{
					property: "og:url",
					content: baseUrl,
				},
				{
					property: "og:title",
					content: "SG Voucher Manager",
				},
				{
					property: "og:description",
					content: "Manage your Singapore vouchers easily",
				},
				{
					property: "og:image",
					content: `${baseUrl}/og-image.png`,
				},
				{
					property: "og:image:width",
					content: "1200",
				},
				{
					property: "og:image:height",
					content: "630",
				},
				{
					property: "og:site_name",
					content: "SG Voucher Manager",
				},
				// Twitter
				{
					name: "twitter:card",
					content: "summary_large_image",
				},
				{
					name: "twitter:url",
					content: baseUrl,
				},
				{
					name: "twitter:title",
					content: "SG Voucher Manager",
				},
				{
					name: "twitter:description",
					content: "Manage your Singapore vouchers easily",
				},
				{
					name: "twitter:image",
					content: `${baseUrl}/og-image.png`,
				},
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
				{
					rel: "apple-touch-icon",
					href: "/apple-touch-icon.png",
					sizes: "180x180",
				},
				{
					rel: "icon",
					href: "/favicon-32x32.png",
					sizes: "32x32",
				},
				{
					rel: "icon",
					href: "/favicon-16x16.png",
					sizes: "16x16",
				},
				{
					rel: "manifest",
					href: "/site.webmanifest",
				},
			],
		};
	},
	shellComponent: RootDocument,
	notFoundComponent: () => <NotFound />,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				<Header />
				<main>{children}</main>
				<Footer />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel />,
							defaultOpen: true,
						},
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
