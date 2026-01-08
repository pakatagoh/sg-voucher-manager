import { createStart } from "@tanstack/react-start";
import { securityHeadersMiddleware } from "./server/middleware";

/**
 * TanStack Start Configuration
 *
 * This file configures the TanStack Start instance with global middleware
 * that runs on every HTTP request.
 *
 * Security Headers Middleware:
 * - Adds security headers to all responses
 * - Runs automatically on every request
 * - Protects against XSS, clickjacking, and other common attacks
 */
export const startInstance = createStart(() => {
	return {
		// requestMiddleware: [],
		requestMiddleware: [securityHeadersMiddleware],
	};
});
