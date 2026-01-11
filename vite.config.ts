import netlify from "@netlify/vite-plugin-tanstack-start";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	build: {
		sourcemap: true, // Source map generation must be turned on for sentry vite plugin
	},
	define: {
		// Inject SENTRY_RELEASE as a compile-time constant for client-side code
		"import.meta.env.VITE_SENTRY_RELEASE": JSON.stringify(
			process.env.SENTRY_RELEASE || "development",
		),
	},
	plugins: [
		// Only enable devtools in development
		...(process.env.NODE_ENV === "development" ? [devtools()] : []),
		// nitro(),
		netlify(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		sentryVitePlugin({
			authToken: process.env.SENTRY_AUTH_TOKEN,
			org: "personal-kqc",
			project: "sg-vouchers",
			release: {
				name: process.env.SENTRY_RELEASE, // Will be set during build
			},
			sourcemaps: {
				filesToDeleteAfterUpload: [
					"./**/*.map",
					".*/**/public/**/*.map",
					"./dist/**/client/**/*.map",
				],
			},
		}),
	],
});

export default config;
