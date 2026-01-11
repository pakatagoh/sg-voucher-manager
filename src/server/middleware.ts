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
		// result.response.headers.set("X-Frame-Options", "DENY");
		result.response.headers.set("X-Content-Type-Options", "nosniff");
		result.response.headers.set("X-XSS-Protection", "1; mode=block");
		result.response.headers.set(
			"Referrer-Policy",
			"strict-origin-when-cross-origin",
		);

		// Content Security Policy - Level 1 with frame-ancestors
		const cspDirectives = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"connect-src 'self' https://*.ingest.sentry.io https://*.sentry.io",
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
