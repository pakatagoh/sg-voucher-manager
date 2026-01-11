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
			before_send: (captureResult) => {
				if (captureResult?.event === "$autocapture") {
					if (captureResult.properties.$external_click_url) {
						if (
							typeof captureResult.properties.$external_click_url === "string"
						) {
							// Match voucher URLs with or without query parameters
							// Pattern: https://voucher.redeem.gov.sg/{voucherId}?optional-query-params
							const voucherUrlPattern =
								/^https:\/\/voucher\.redeem\.gov\.sg\/[A-Za-z0-9_-]+(\?.*)?$/;

							if (
								voucherUrlPattern.test(
									captureResult.properties.$external_click_url,
								)
							) {
								// Sanitize by replacing with a generic pattern
								captureResult.properties.$external_click_url =
									"https://voucher.redeem.gov.sg/:id";
							}
						}
					}
				}
				return captureResult;
			},
		});
	}
}

/**
 * Safely capture PostHog events only when PostHog is initialized
 * This prevents hydration mismatches by ensuring PostHog is ready
 */
export function captureEvent(
	eventName: string,
	properties?: Record<string, unknown>,
) {
	if (typeof window !== "undefined" && posthog.__loaded) {
		posthog.capture(eventName, properties);
	}
}

export { posthog };
