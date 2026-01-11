import posthog from "posthog-js";

export function initPostHog() {
	if (typeof window !== "undefined") {
		const postHogKey = import.meta.env.VITE_POSTHOG_KEY;
		const postHogHost = import.meta.env.VITE_POSTHOG_HOST;

		if (!postHogKey) {
			console.warn("PostHog key not set. Skipping PostHog initialization.");

			return;
		}
		if (!postHogHost) {
			console.warn("PostHog host not set.");
		}

		posthog.init(postHogKey, {
			api_host: postHogHost || "https://us.i.posthog.com",
			ui_host: "https://us.posthog.com",
			defaults: "2025-05-24",
			capture_exceptions: false,
			capture_pageleave: false,
			enable_heatmaps: true,
			debug: import.meta.env.DEV,
			loaded: (posthog) => {
				if (import.meta.env.DEV) posthog.debug();
			},
		});
	}
}

export { posthog };
