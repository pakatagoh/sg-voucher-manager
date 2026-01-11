import posthog from "posthog-js";

/**
 * Sanitizes voucher URLs to remove sensitive IDs before sending to analytics
 *
 * Replaces URLs matching the pattern:
 * https://voucher.redeem.gov.sg/{voucherId}?optional-query-params
 *
 * With a generic pattern:
 * https://voucher.redeem.gov.sg/:id
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or the original if no match
 */
function sanitizeVoucherUrl(url: string): string {
	// Match voucher URLs with or without query parameters
	// Pattern: https://voucher.redeem.gov.sg/{voucherId}?optional-query-params
	const voucherUrlPattern =
		/^https:\/\/voucher\.redeem\.gov\.sg\/[A-Za-z0-9_-]+(\?.*)?$/;

	if (voucherUrlPattern.test(url)) {
		return "https://voucher.redeem.gov.sg/:id";
	}

	return url;
}

/**
 * Sanitizes URL properties in PostHog capture result
 *
 * @param properties - The properties object to sanitize
 * @param propertyKey - The key of the property containing the URL
 */
function sanitizeUrlProperty(
	properties: Record<string, unknown>,
	propertyKey: string,
): void {
	const value = properties[propertyKey];

	if (typeof value === "string") {
		properties[propertyKey] = sanitizeVoucherUrl(value);
	}
}

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
				if (captureResult?.properties) {
					// Sanitize external click URLs to remove sensitive voucher IDs
					sanitizeUrlProperty(captureResult.properties, "$external_click_url");
					sanitizeUrlProperty(
						captureResult.properties,
						"$last_external_click_url",
					);
				}
				return captureResult;
			},
		});
	}
}

export function captureEvent(
	eventName: string,
	properties?: Record<string, unknown>,
) {
	if (typeof window !== "undefined" && posthog.__loaded) {
		posthog.capture(eventName, properties);
	}
}

export { posthog };
