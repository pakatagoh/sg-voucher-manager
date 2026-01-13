# No longer deployed to production - for local use only
>
> SG Voucher Manager was built to help manage CDC and Climate vouchers, but I understand unofficial tools like this can cause confusion around official government systems.
>
> In Singapore, public trust in government systems is held to a very high standard, and that’s something I respect and want to uphold.
>
> So at the request of Singapore government officers, I’ve complied and taken SG Voucher Manager down publicly
>
> This repo will still be left as but may be subjected to deletion
>
> Users should not deploy this site for public use
>
> Security of your deployment infrastructure and the logic in this codebase is not guaranteed by the Singapore government

# SG Voucher Manager

A modern web application for managing and validating Singapore CDC vouchers. Built with React 19, TanStack Start, and deployed on Netlify.

## Project Overview

**Project Name:** SG Voucher Manager (manage-cdc)  
**Tech Stack:** React 19 + TanStack Start + TypeScript + Tailwind CSS 4  
**Design Style:** Bauhaus Minimal (geometric shapes, sharp corners, bold typography)  
**Deployment:** Netlify

## Features

- Validate Singapore CDC voucher URLs
- Extract and display voucher information from government APIs
- Client-side voucher link storage
- Error tracking and monitoring
- Analytics and user insights

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.21.1 (specified in `.nvmrc`)
- **npm**: Latest version (comes with Node.js)

### Recommended Tools

- **mise** (Recommended): Modern tool version manager

  ```bash
  # Install mise (macOS/Linux)
  curl https://mise.run | sh
  
  # Use the correct Node version (automatically reads mise.toml)
  mise install
  ```
  
  **Note:** `nvm` also works if you prefer it over mise.

- **Visual Studio Code**: Recommended IDE with the following extensions:
  - Biome (for linting and formatting)
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
```

and `cd` into the repository

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

#### Server Environment Variables

```bash
# Sentry Configuration (Error tracking and monitoring)
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Note: SENTRY_RELEASE is automatically set during build
# - Local builds: SENTRY_RELEASE=$(git rev-parse HEAD)
# - Netlify: SENTRY_RELEASE=$COMMIT_REF
```

#### Public Environment Variables (Client-side)

```bash
# Application Configuration
VITE_APP_NAME=sg-voucher-manager
VITE_APP_URL=https://your-domain.com
VITE_ENVIRONMENT=development

# Sentry DSN (for client-side error tracking)
VITE_SENTRY_DSN=your_sentry_dsn

# PostHog Configuration (Analytics)
VITE_POSTHOG_KEY=your_posthog_key
VITE_POSTHOG_HOST=https://your-posthog-host.com
```

### 4. Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Code Style & Standards

This project uses **Biome** for linting and formatting

See `biome.json`

See [AGENTS.md](./AGENTS.md) for detailed code style guidelines.

## Project Structure

```
manage-cdc/
├── public/                 # Static assets (favicon, manifest, images)
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   └── voucher/      # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries and Zod schemas
│   ├── routes/           # TanStack Router file-based routes
│   ├── server/           # Server-side code
│   │   ├── middleware.ts # middlewares
│   │   ├── voucher.ts    # Voucher API server functions
│   │   └── sentry.ts     # Sentry configuration
│   ├── types/            # TypeScript type definitions
│   ├── router.tsx        # Router configuration
│   ├── start.ts          # Application entry point
│   └── styles.css        # Global styles
├── .env.example          # Environment variables template
├── .nvmrc                # Node version specification
├── netlify.toml          # Netlify deployment configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── AGENTS.md             # Detailed development guide
```

## Deployment

### Netlify

This application is configured for deployment on **Netlify**

#### Configuration

The `netlify.toml` file includes:

- **Build command:** Automatic Sentry release tracking
- **Headers:** Proper content-type for PWA manifest
- **Redirects:** PostHog analytics proxy to avoid ad blockers

## External Services Integration

### 1. Sentry (Error Tracking & Performance Monitoring)

**Purpose:** Error tracking, performance monitoring, and metrics

**Setup:**

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for your application
3. Get your DSN and Auth Token
4. Add to `.env` file

### 2. PostHog (Product Analytics)

**Purpose:** User analytics, feature flags, session recording

**Configuration:**

- Proxy configured via Netlify redirects (`/ph/*` → PostHog)
- Prevents ad-blocker interference
- Captures page views and custom events

**Setup:**

1. Create a PostHog account at [posthog.com](https://posthog.com)
2. Create a new project
3. Get your project key and host URL
4. Add to `.env` file

### 3. CDC API (Singapore Government)

**Purpose:** Validate voucher IDs and retrieve voucher data

**Configuration:**

- Input validation with Zod schemas
- Error handling and retry logic

**No setup required** - This is a public API provided by the Singapore government.

## Key Technologies

- **Framework:** [TanStack Start](https://tanstack.com/start) - Full-stack React framework with SSR
- **Data Fetching:** [TanStack Query](https://tanstack.com/query) - Server state management
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Validation:** [Zod](https://zod.dev) - TypeScript-first schema validation
- **Icons:** [Lucide React](https://lucide.dev) - Icon library
- **Linting/Formatting:** [Biome](https://biomejs.dev) - Fast linter and formatter
- **Build Tool:** [Vite](https://vite.dev) - Next generation frontend tooling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues or questions, please create an issue in the repository.
