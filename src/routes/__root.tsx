import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Header from "../components/Header";

import appCss from "../styles.css?url";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: true,
		},
	},
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "CDC Voucher Manager",
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
	}),

	shellComponent: RootDocument,
	notFoundComponent: NotFound,
	ssr: false,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				<QueryClientProvider client={queryClient}>
					<Header />
					{children}
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
				</QueryClientProvider>
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<div style={{ padding: "2rem", textAlign: "center" }}>
			<h1>404 - Page Not Found</h1>
			<p>The page you are looking for does not exist.</p>
		</div>
	);
}
