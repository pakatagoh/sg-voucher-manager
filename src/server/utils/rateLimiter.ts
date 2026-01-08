/**
 * Rate Limiter using Token Bucket Algorithm
 * Each IP address gets its own bucket of tokens that refills over time
 */

interface RateLimitEntry {
	tokens: number; // Current number of tokens available
	lastRefill: number; // Timestamp of last token refill
}

interface RateLimitResult {
	allowed: boolean; // Whether the request is allowed
	remaining: number; // Remaining tokens after this request
	resetAt: number; // Timestamp when next token will be available
}

interface RateLimiterConfig {
	maxRequests: number; // Maximum number of tokens in the bucket
	windowMs: number; // Time window in milliseconds
}

export class RateLimiter {
	private limits = new Map<string, RateLimitEntry>();
	private maxTokens: number;
	private refillRate: number; // Tokens per millisecond
	private refillInterval: number; // Milliseconds per token
	private lastCleanup = Date.now();

	constructor(config: RateLimiterConfig) {
		this.maxTokens = config.maxRequests;
		this.refillRate = config.maxRequests / config.windowMs;
		this.refillInterval = config.windowMs / config.maxRequests;
	}

	/**
	 * Check if a request from the given IP should be allowed
	 */
	checkLimit(ip: string): RateLimitResult {
		// Clean up stale entries every 5 minutes
		this.cleanupIfNeeded();

		const now = Date.now();
		let entry = this.limits.get(ip);

		// First request from this IP - give them a full bucket
		if (!entry) {
			entry = {
				tokens: this.maxTokens - 1, // Deduct 1 token for this request
				lastRefill: now,
			};
			this.limits.set(ip, entry);

			return {
				allowed: true,
				remaining: entry.tokens,
				resetAt: now + this.refillInterval,
			};
		}

		// Calculate how many tokens to refill based on time elapsed
		const timeSinceLastRefill = now - entry.lastRefill;
		const tokensToAdd = Math.floor(timeSinceLastRefill * this.refillRate);

		if (tokensToAdd > 0) {
			entry.tokens = Math.min(this.maxTokens, entry.tokens + tokensToAdd);
			entry.lastRefill = now;
		}

		// Check if there are tokens available
		if (entry.tokens > 0) {
			entry.tokens -= 1; // Consume a token

			return {
				allowed: true,
				remaining: entry.tokens,
				resetAt: now + this.refillInterval,
			};
		}

		// No tokens available - request denied
		// Calculate when the next token will be available
		const timeUntilNextToken = this.refillInterval - timeSinceLastRefill;
		const resetAt = now + Math.max(0, timeUntilNextToken);

		return {
			allowed: false,
			remaining: 0,
			resetAt,
		};
	}

	/**
	 * Clean up stale entries to prevent memory leaks
	 * Removes entries that haven't been accessed in 10 minutes
	 */
	private cleanupIfNeeded(): void {
		const now = Date.now();
		const cleanupInterval = 5 * 60 * 1000; // 5 minutes

		if (now - this.lastCleanup < cleanupInterval) {
			return;
		}

		this.lastCleanup = now;
		const staleThreshold = now - 10 * 60 * 1000; // 10 minutes

		for (const [ip, entry] of this.limits.entries()) {
			if (entry.lastRefill < staleThreshold) {
				this.limits.delete(ip);
			}
		}
	}

	/**
	 * Get the maximum number of tokens (for response headers)
	 */
	get max(): number {
		return this.maxTokens;
	}
}

// Create a singleton instance for the voucher endpoint
// 30 requests per minute per IP
export const voucherRateLimiter = new RateLimiter({
	maxRequests: 30,
	windowMs: 60 * 1000, // 1 minute
});
