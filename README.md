# Modern Astro Full-Stack Application

![Astro](https://img.shields.io/badge/astro-5.10.1-orange.svg) ![Better Auth](https://img.shields.io/badge/better--auth-1.2.12-blue.svg) ![Prisma](https://img.shields.io/badge/prisma-6.12.0-2D3748.svg) ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4.1.11-38B2AC.svg)

A **modern full-stack web application** built with Astro 5, featuring server-side rendering, authentication, email services, and database integration. Perfect for content-rich websites that need user management and transactional email capabilities.

**Live Demo**: [gruntworksagency.com](https://gruntworksagency.com)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fgruntwebsite)

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Features & Architecture](#features--architecture)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Customization](#customization)

## Quick Start

Get running in under 5 minutes:

```bash
# Clone the repository
git clone https://github.com/your-username/gruntwebsite.git
cd gruntwebsite

# Install dependencies with Bun
bun install

# Copy environment template
cp .env.example .env

# Start development server
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) to see your application.

> **Note**: The app will run in development mode without database/email configuration, but you'll need to set up services for full functionality.

## Environment Configuration

### Required Environment Variables

| Variable                     | Description                  | Example                             | Required |
| ---------------------------- | ---------------------------- | ----------------------------------- | -------- |
| `DATABASE_URL`               | PostgreSQL connection string | `postgres://user:pass@host:5432/db` | Yes      |
| `BETTER_AUTH_SECRET`         | Session encryption key       | `your-secret-key`                   | Yes      |
| `BETTER_AUTH_URL`            | Application base URL         | `http://localhost:4321`             | Yes      |
| `RESEND_API_KEY`             | Resend email service API key | `re_live_xxxxx`                     | Yes      |
| `RESEND_FROM_EMAIL`          | Verified sender email        | `no-reply@yourdomain.com`           | Yes      |
| `MAIL_DOMAIN`                | Domain for email DNS records | `yourdomain.com`                    | Yes      |
| `GOOGLE_CLIENT_ID`           | Google OAuth client ID       | `xxxxx.googleusercontent.com`       | No       |
| `GOOGLE_CLIENT_SECRET`       | Google OAuth client secret   | `xxxxx`                             | No       |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key          | `AIza...`                           | No       |

### Service Provider Setup

#### 1. Database (Neon)

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

#### 2. Email Service (Resend)

1. Sign up at [Resend](https://resend.com)
2. Verify your domain
3. Set up SPF, DKIM, and DMARC records
4. Get API key and add to `RESEND_API_KEY`
5. Set `RESEND_FROM_EMAIL` to a verified sender address

#### 3. Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:4321/api/auth/callback/google`

## Features & Architecture

### 🔐 Authentication System

- **Email/Password** authentication with verification
- **Magic Link** authentication for passwordless login
- **Google OAuth** social authentication
- **Session Management** with secure cookies
- **Route Protection** via middleware

### 📧 Email Infrastructure

- **Transactional Emails** (verification, password reset, magic links)
- **Bulk Email Support** with unsubscribe headers
- **Development Mode** with Ethereal email testing
- **Production Mode** with Resend service
- **Webhook Handling** for email events

### 🗄️ Database Integration

- **Prisma ORM** with type-safe queries
- **Neon Serverless** PostgreSQL adapter
- **Migration System** for schema changes
- **Connection Pooling** for performance

### 🎨 UI/UX Features

- **Tailwind CSS 4** with utility-first styling
- **Preline UI** components library
- **Lenis Smooth Scrolling** (configurable)
- **GSAP Animations** on product/insight pages
- **Dark Mode** support with theme persistence
- **Responsive Design** across all devices


### 🔍 Business Search Integration

- **Google Places API** autocomplete for business search
- **Auto-populated Forms** with verified business data
- **Real-time Suggestions** with familiar Google-style interface
- **Complete Business Profiles** including Google Business Profile URLs
- **Smart Data Capture** for accurate business information

### 📚 Content Management

- **Content Collections** for structured data
- **Starlight Documentation** with search and navigation
- **Blog System** with categories and tags
- **Product Catalog** with specifications
- **FAQ Management** via JSON configuration
- **Pricing Tables** with feature comparison

### 🛡️ Security & Performance

- **CSP Headers** configured via Vercel
- **Rate Limiting** on authentication endpoints
- **Environment Validation** in CI/CD
- **HTML Minification** in production builds
- **Image Optimization** with Sharp

## Development Workflow

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run start        # Alias for dev

# Building
bun run build        # Type check, build, and optimize
bun run preview      # Preview production build locally

# Utilities
bun run astro        # Run Astro CLI commands
```

### Git Hooks & Linting

The project uses Husky for Git hooks and lint-staged for code formatting:

- **Pre-commit**: Automatically formats code with Prettier
- **Supported files**: `.js`, `.ts`, `.astro`, `.css`, `.scss`
- **Configuration**: See `lint-staged` in `package.json`

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/verify-env.yml`) validates:

- All required environment variables are present
- Environment variable format validation
- Successful build with email configuration
- Runs on feature branches and pull requests

## Deployment

### Vercel Deployment

1. **Environment Setup**: Configure all environment variables in Vercel dashboard
2. **Build Settings**:
   - Build Command: `bun run build`
   - Output Directory: `dist`
   - Install Command: `bun install`
3. **Security**: Headers are configured via `vercel.json`

#### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Email domain verified and DNS records set
- [ ] Google OAuth redirect URIs updated
- [ ] CSP headers reviewed and tested
- [ ] Build process validated in CI

### Security Headers

The `vercel.json` configuration includes:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict Transport Security (HSTS)
- Referrer Policy

## Project Structure

```
src/
├── assets/              # Scripts and styles
│   ├── scripts/         # JavaScript utilities (Lenis, etc.)
│   └── styles/          # CSS files and Tailwind config
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (buttons, cards, etc.)
│   ├── sections/        # Page sections (navbar, footer, hero)
│   └── Meta.astro       # SEO and metadata component
├── layouts/             # Page layout templates
│   ├── MainLayout.astro # Primary site layout
│   └── AuthLayout.astro # Authentication pages layout
├── lib/                 # Core utilities and integrations
│   ├── auth.ts          # Better Auth configuration
│   ├── auth-client.ts   # Client-side auth utilities
│   ├── email.ts         # Email service integration
│   └── prisma.ts        # Database client setup
├── pages/               # File-based routing
│   ├── api/             # API endpoints
│   │   ├── auth/        # Authentication routes
│   │   └── resend/      # Email webhook handlers
│   ├── blog/            # Blog pages
│   ├── products/        # Product catalog
│   ├── insights/        # Insights/articles
│   ├── login.astro      # Authentication page
│   ├── audit.astro      # Protected page example
│   └── index.astro      # Homepage
├── content/             # Content collections
│   ├── blog/            # Blog posts (Markdown)
│   ├── products/        # Product data (Markdown)
│   ├── docs/            # Documentation (Starlight)
│   └── insights/        # Insight articles
├── data_files/          # JSON data for collections
│   ├── faqs.json        # FAQ entries
│   ├── features.json    # Feature definitions
│   └── pricing.json     # Pricing tiers
├── utils/               # Shared utilities
│   ├── navigation.ts    # Site navigation config
│   └── utils.ts         # General purpose utilities
├── middleware.ts        # Request middleware (auth, routing)
└── content.config.ts    # Content collections schema
```

### Key Files

- **`astro.config.mjs`**: Astro configuration with integrations
- **`middleware.ts`**: Authentication and route protection
- **`content.config.ts`**: Content collections and schema definitions
- **`vercel.json`**: Security headers and deployment config
- **`.env.example`**: Environment variable template

## Customization

### Content Collections

Modify content schemas in `src/content.config.ts`:

```typescript
const blogCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.date(),
      // Add your custom fields here
    }),
});
```

### Navigation & Footer

Edit `src/utils/navigation.ts` to customize site navigation:

```typescript
export const navBarLinks: NavLink[] = [
  { name: "Home", url: "/" },
  { name: "Products", url: "/products" },
  { name: "Blog", url: "/blog" },
  { name: "Contact", url: "/contact" },
];
```

### Styling

- **Global styles**: `src/assets/styles/global.css`
- **Tailwind config**: Configured via Vite plugin in `astro.config.mjs`
- **Component styles**: Scoped CSS in `.astro` files
- **Theme customization**: Update CSS custom properties for brand colors

### Email Templates

Customize email templates in `src/lib/email.ts`:

```typescript
export function renderMagicLinkEmail(url: string): string {
  return `
    <html>
      <body>
        <h1>Your Magic Link</h1>
        <p>Click <a href="${url}">here</a> to sign in.</p>
      </body>
    </html>
  `;
}
```

### Animations

- **Lenis**: Configure smooth scrolling in `src/assets/scripts/lenisSmoothScroll.js`
- **GSAP**: Add animations in individual page scripts
- **CSS**: Custom animations via Tailwind or CSS classes

---

## Tools and Technologies

- **[Astro 5](https://astro.build/)** - Modern web framework with SSR
- **[Better Auth](https://better-auth.com/)** - TypeScript-first authentication
- **[Prisma](https://prisma.io/)** - Type-safe database ORM
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL
- **[Resend](https://resend.com/)** - Developer-first email API
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Preline UI](https://preline.co/)** - Tailwind CSS components
- **[Starlight](https://starlight.astro.build/)** - Documentation theme
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and toolkit

---

**Ready to build something amazing?** Star the repository and start customizing your full-stack Astro application today!
