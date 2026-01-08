import { createMiddleware } from "@tanstack/react-start";

/**
 * Security Headers Middleware for TanStack Start
 *
 * This global request middleware adds security headers to all HTTP responses
 * to protect against common web vulnerabilities like XSS, clickjacking, and
 * MIME-sniffing attacks.
 *
 * This middleware runs on every request and applies headers before any
 * route handlers or server functions execute.
 */
export const securityHeadersMiddleware = createMiddleware().server(
	async ({ next }) => {
		const result = await next();

		// Add comprehensive security headers to the response
		result.response.headers.set("X-Frame-Options", "DENY");
		result.response.headers.set("X-Content-Type-Options", "nosniff");
		result.response.headers.set("X-XSS-Protection", "1; mode=block");
		result.response.headers.set(
			"Referrer-Policy",
			"strict-origin-when-cross-origin",
		);
		result.response.headers.set(
			"Permissions-Policy",
			"geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()",
		);

		// Content Security Policy - Level 1 with frame-ancestors
		const cspDirectives = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"connect-src 'self' https://api-cdc.redeem.gov.sg",
			"font-src 'self' data:",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		];
		result.response.headers.set(
			"Content-Security-Policy",
			cspDirectives.join("; "),
		);

		return result;
	},
);

/**
 * Rate Limiting Middleware for Server Functions
 *
 * This middleware applies rate limiting to server functions to prevent abuse.
 * It uses a token bucket algorithm to track requests per IP address.
 *
 * Configuration:
 * - 30 requests per minute per IP address
 * - Only active in production mode (disabled in development)
 * - Returns user-friendly error messages when rate limit is exceeded
 *
 * Usage: Apply this to server functions that need rate limiting:
 * ```ts
 * export const myServerFn = createServerFn()
 *   .middleware([rateLimitMiddleware])
 *   .handler(async () => { ... })
 * ```
 */
export const rateLimitMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		// Skip rate limiting in development
		if (process.env.NODE_ENV !== "production") {
			return next();
		}

		// Get client IP address from request headers
		// Vercel and most CDNs provide this via X-Forwarded-For
		const forwardedFor = request.headers.get("x-forwarded-for");
		const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

		if (ip === "unknown") {
			throw new Error(
				"Connection error. Please refresh the page and try again.",
			);
		}

		// Import rate limiter dynamically to keep it server-side only
		const { voucherRateLimiter } = await import("./utils/rateLimiter");

		// Check rate limit for this IP
		const result = voucherRateLimiter.checkLimit(ip);

		// Proceed with the request and add rate limit headers to response
		const response = await next();

		// Add rate limit information headers
		response.response.headers.set(
			"X-RateLimit-Limit",
			voucherRateLimiter.max.toString(),
		);
		response.response.headers.set(
			"X-RateLimit-Remaining",
			result.remaining.toString(),
		);
		response.response.headers.set(
			"X-RateLimit-Reset",
			result.resetAt.toString(),
		);

		// If rate limit exceeded, throw error before returning
		if (!result.allowed) {
			const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
			const error = new Error(
				`You're checking vouchers too quickly. Please wait ${retryAfter} second${retryAfter !== 1 ? "s" : ""} and try again.`,
			) as Error & {
				statusCode: number;
				data: { retryAfter: number; resetAt: number };
			};
			error.statusCode = 429;
			error.data = {
				retryAfter,
				resetAt: result.resetAt,
			};
			throw error;
		}

		return response;
	},
);
