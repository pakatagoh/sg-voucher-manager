import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const basePath = env.VITE_BASE_PATH || "/";

	return {
		base: basePath,
		nitro: {
			baseURL: basePath,
		},
		plugins: [
			// this is the plugin that enables path aliases
			viteTsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			tailwindcss(),
			tanstackStart(),
			nitro(),
			viteReact(),
			devtools(),
		],
	};
});
