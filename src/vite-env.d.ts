/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_ENVIRONMENT?: string;
	readonly VITE_SENTRY_DSN?: string;
	readonly VITE_SENTRY_RELEASE?: string;
	readonly VITE_APP_NAME?: string;
	readonly VITE_APP_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
