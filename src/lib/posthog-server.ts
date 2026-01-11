import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient() {
	const postHogKey = process.env.VITE_POSTHOG_KEY;

	if (!posthogClient) {
		if (!postHogKey) {
			return null;
		}

		posthogClient = new PostHog(postHogKey, {
			host: "https://us.i.posthog.com",
			flushAt: 1, // Send immediately
			flushInterval: 0, // No batching delay
		});
	}
	return posthogClient;
}

export async function shutdownPostHog() {
	if (posthogClient) {
		await posthogClient.shutdown();
	}
}
