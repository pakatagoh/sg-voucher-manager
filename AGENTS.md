# Agent Development Guide

This guide provides essential information for coding agents working on the SG Voucher Manager codebase.

## Project Overview

**Project:** SG Voucher Manager (manage-cdc)  
**Stack:** React 19 + TanStack Start + TypeScript + Tailwind CSS 4  
**Framework:** TanStack Start (full-stack React with SSR)  
**Deployment:** Netlify  
**Design System:** Bauhaus Minimal (sharp corners, geometric, bold typography)

## Build & Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Production
npm run build            # Build for production
npm run start            # Start production server (node dist/server/server.js)
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run Biome linter
npm run format           # Run Biome formatter
npm run check            # Run both linter and formatter

# Testing
npm run test             # Run all tests with Vitest
vitest run               # Same as npm run test
vitest --watch           # Run tests in watch mode
vitest run path/to/file.test.tsx  # Run a single test file
```

### Running a Single Test

```bash
# Run a specific test file
vitest run src/components/voucher/AddVoucherForm.test.tsx

# Run tests matching a pattern
vitest run --grep "AddVoucherForm"

# Watch mode for a single file
vitest --watch src/components/voucher/AddVoucherForm.test.tsx
```

## Code Style Guidelines

### Formatting (Biome)

- **Indentation:** Tabs (NOT spaces)
- **Quotes:** Double quotes for strings
- **Line length:** No specific limit (use good judgment)
- **Import organization:** Automatically organized by Biome
- **Semicolons:** Required by formatter

### Imports

Follow this order (auto-organized by Biome):
1. Type imports (`import type`)
2. External dependencies (React, third-party)
3. Internal absolute imports (`@/components`, `@/lib`, etc.)
4. Relative imports

```typescript
import type { FormEventHandler } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVoucherLinks } from "@/hooks/useVoucherLinks";
```

### TypeScript

- **Strict mode:** Always enabled
- **Type annotations:** Explicit for function parameters and return types
- **Interfaces vs Types:** Use `interface` for object shapes, `type` for unions/aliases
- **No unused variables:** TypeScript will error on unused locals and parameters
- **Path aliases:** Use `@/*` for imports from `src/`

```typescript
// Good
export interface VoucherLink {
	id: string;
	voucherId: string;
	url: string;
	createdAt: string;
}

export type VoucherType = "heartland" | "supermarket" | "climate";

// Good - explicit return type
export function getVoucherLinks(): VoucherLink[] {
	// ...
}

// Bad - implicit return type (avoid for exported functions)
export function getVoucherLinks() {
	// ...
}
```

### Naming Conventions

- **Files:** camelCase for utilities, PascalCase for components
  - Components: `AddVoucherForm.tsx`, `VoucherDataDisplay.tsx`
  - Utils: `voucherStorage.ts`, `rateLimiter.ts`
- **Variables/Functions:** camelCase (`handleSubmit`, `voucherData`)
- **Constants:** UPPER_SNAKE_CASE (`STORAGE_KEY`, `API_URL`)
- **Types/Interfaces:** PascalCase (`VoucherLink`, `ProcessedVoucherData`)
- **Components:** PascalCase function declarations

```typescript
// Good
export function AddVoucherForm() {
	const formRef = useRef<HTMLFormElement>(null);
	// ...
}

// Bad (arrow function for components)
export const AddVoucherForm = () => {
	// ...
}
```

### React Patterns

- **Components:** Use function declarations (not arrow functions)
- **Hooks:** Always at the top level, follow Rules of Hooks
- **Event handlers:** Use inline functions or `FormEventHandler` types
- **Refs:** Use `useRef` with explicit types
- **Forms:** Use native FormData API with TanStack Start patterns

```typescript
export function AddVoucherForm() {
	const formRef = useRef<HTMLFormElement>(null);
	const { addLink } = useVoucherLinks();

	const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const url = formData.get("url") as string;
		// ...
	};

	return <form ref={formRef} onSubmit={handleSubmit}>...</form>;
}
```

### Error Handling

- **Server functions:** Throw descriptive Error objects
- **Client-side:** Return success/error objects from utility functions
- **UI:** Display errors in bordered containers with uppercase labels

```typescript
// Server-side
if (!response.ok) {
	const message = `API request failed: ${response.statusText}`;
	throw new Error(message);
}

// Client-side utility
try {
	// operation
	return { success: true, message: "Operation successful" };
} catch (error) {
	console.error("Error description:", error);
	return { success: false, message: "Operation failed" };
}

// UI error display
{addLink.isError && (
	<div className="border-2 border-destructive bg-muted p-4 mt-4">
		<p className="font-bold uppercase text-sm mb-1">Error</p>
		<p className="text-sm">{addLink.error.message}</p>
	</div>
)}
```

### Comments & Documentation

- **JSDoc:** Use for exported functions and complex logic
- **Inline comments:** Explain "why", not "what"
- **TODO comments:** Include context and ticket references

```typescript
/**
 * Server function to get voucher data from CDC API
 *
 * This function:
 * 1. Validates the voucher ID format
 * 2. Tracks metrics with Sentry
 * 3. Applies rate limiting (30 requests/min in production)
 * 4. Fetches voucher data from the Singapore government API
 */
export const getVoucherData = createServerFn({ method: "POST" })
	// ...
```

## File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── voucher/         # Feature-specific components
│   └── *.tsx            # Layout components (Header, Footer, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and schemas
├── routes/              # TanStack Router file-based routes
├── server/              # Server-side code
│   ├── utils/           # Server utilities
│   └── *.ts             # Server functions and middleware
├── types/               # Shared TypeScript types
├── router.tsx           # Router configuration
└── start.ts             # Application entry point
```

## Key Technologies & Patterns

- **Routing:** TanStack Router with file-based routing
- **Data fetching:** TanStack Query + TanStack Start server functions
- **Styling:** Tailwind CSS 4 with CSS variables + shadcn/ui (New York style)
- **Validation:** Zod schemas for input validation
- **Monitoring:** Sentry for error tracking and metrics
- **Storage:** localStorage for client-side persistence
- **Icons:** Lucide React

## Environment Variables

Create `.env` from `.env.example`:
- `ENVIRONMENT` - Server environment (development/production)
- `SENTRY_AUTH_TOKEN` - Sentry authentication token
- `VITE_ENVIRONMENT` - Client-side environment variable

## Testing Guidelines

- **Framework:** Vitest + Testing Library
- **Test location:** Co-locate tests with source files (`Component.test.tsx`)
- **Test environment:** jsdom for React components
- **Current status:** Testing infrastructure set up, no tests written yet

## Important Notes

- **Auto-generated files:** Never edit `src/routeTree.gen.ts`
- **Global styles:** `src/styles.css` is excluded from Biome formatting
- **Design system:** Maintain Bauhaus aesthetic (zero border-radius, geometric)
- **Server functions:** Use TanStack Start patterns with validation
- **Rate limiting:** Available via middleware (currently commented out)
