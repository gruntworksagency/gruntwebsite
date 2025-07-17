# Versatile Landing, Blog & Docs Template for a Simplified Web Presence

![Gruntworks](https://github.com/mearashadowfax/Gruntworks/assets/125820963/cdf299bd-414a-4a2d-baf0-d188bb4709c7)

Gruntworks is an **open-source template** designed for quick and efficient web project setup, blending **minimalism with functionality**. Whether you're showcasing a portfolio, launching a company landing page, or running a blog, Gruntworks provides everything you need. By combining the power of the [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/), and [Preline UI](https://preline.co/), this template offers a functional and aesthetically pleasing solution for your web presence.

<p align="left">
    <a href="https://gruntworksagency.com" target="_blank">
      <img src="https://vyclk3sx0z.ufs.sh/f/hv6ttNERWpXu6c2AP0GCBnYt4h3FbsMuKyP5RxQ21HvzIae0" alt="Gruntworks Demo" width="180"/></a>
  &nbsp;&nbsp;&nbsp;
    <a href="https://atemplate.com/item/gruntworks" target="_blank">
      <img src="https://atemplate.com/badages-awards.svg" alt="Gruntworks | A template" width="180"/></a>
</p>

## Table of Contents

- [Why Choose Gruntworks?](#why-choose-gruntworks)
- [What's New](#whats-new)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Development Commands](#development-commands)
- [Deployment](#deployment)
  - [Building Your Site](#building-your-site)
  - [Deploying to Vercel](#deploying-to-vercel)
  - [Deploying to Netlify](#deploying-to-netlify)
- [Project Structure](#project-structure)
- [Static Assets and Public Resources](#static-assets-and-public-resources)
- [Customization](#customization)
  - [Editing Component Variables](#editing-component-variables)
  - [Props in Component Instances](#props-in-component-instances)
  - [Customizing Navigation and Footer Links](#customizing-navigation-and-footer-links)
    - [Navigation Bar Links](#navigation-bar-links)
    - [Footer Links](#footer-links)
    - [Social Media Links](#social-media-links)
- [Integrations and Enhancements](#integrations-and-enhancements)
  - [Starlight Documentation](#starlight-documentation)
  - [Lenis for Smooth Scrolling](#lenis-for-smooth-scrolling)
  - [GSAP Integration](#gsap-integration)
  - [Hiding Scrollbar](#hiding-scrollbar)
  - [SEO Configuration](#seo-configuration)
    - [Using constants.ts](#using-constantsts)
    - [Applying Metadata in Layouts](#applying-metadata-in-layouts)
    - [Passing Individual Schema](#passing-individual-schema)
    - [Extending Metadata for SEO](#extending-metadata-for-seo)
    - [Structured Data and Rich Snippets](#structured-data-and-rich-snippets)
    - [Using Astro SEO Integrations](#using-astro-seo-integrations)
  - [Robots.txt](#robotstxt)
  - [Markdown/MDX](#markdownmdx)
    - [Image Integration](#image-integration)
  - [Astro Integrations](#astro-integrations)
  - [Flexibility with Integrations](#flexibility-with-integrations)
- [Tools and Technologies](#tools-and-technologies)
  - [Preline UI](#preline-ui)
  - [Tailwind CSS](#tailwind-css)
  - [Deployment and Security](#deployment-and-security)
  - [HTML Minification](#html-minification)
- [Contributing](#contributing)
- [License](#license)

## Why Choose Gruntworks?

- **Efficient Architecture:** Deploy faster with a template that's simple to set up and navigate.
- **Optimized for Small Projects:** Perfect for crisp, professional web personas without excess complexity.
- **Highly Customizable:** Flexibly adapt and style your site using Astro and Tailwind CSS.

### Features

- **Astro-Powered:** Utilize a modern static-site generation framework.
- **Tailwind CSS:** Enjoy rapid UI development with a utility-first CSS framework.
- **Preline UI:** Implement prebuilt UI components for added elegance.
- **GSAP Integration:** Impress with professional and polished animations.
- **Markdown Content Collections:** Organize and manage your content seamlessly.
- **Starlight Documentation:** A sleek, user-friendly, full-featured documentation theme.
- **SEO and Responsiveness:** Ensure your site is discoverable and accessible on any device.

## What's New

- [x] **Social Share Component**:
  - Enables users to share blog posts on social media platforms.
  - Provides easy sharing of a blog post's title and URL.
  - Integrates Clipboard.js for easy link copying.

- [x] **Bookmark Button Component**:
  - Allows users to bookmark blog posts for later reference using `localStorage`.
  - Provides a visual indication of whether a post is bookmarked.
  - For SSR, replace `localStorage` with cookies to persist bookmarked posts.
    - This setup opens up the possibility for the server to dynamically render content based on user-specific bookmarks, should you choose to implement this feature.

- [x] **Post Feedback Component**:
  - Collects user feedback at the end of blog posts.
  - Serves as a UI demonstration (no back-end integration currently).
- [x] **Starlight Documentation Theme Integration**:
  - A sleek, user-friendly, full-featured documentation theme, which enhances the readability and usability of documentation.
  - Enhances readability and usability of documentation with features like site navigation, search, dark mode, and code highlighting.

- [x] **Icon Set Component**:
  - Centralizes SVG icons for easy management and updates.
  - Render any pre-defined icon SVG using `<Icon name="iconName" />` in your Astro components.
  - **Note:** Developers have the option to use other community integrations like [astro-icons](https://github.com/natemoo-re/astro-icon). However, the author decided to create a custom icon set component for managing custom icons.

- [x] **Dynamic Table of Contents (ToC) with Scroll Progress Indicator**:
  - Highlights the relevant section in the ToC with a scroll progress indicator.
  - Developers seeking alternatives might consider the [remark-toc](https://github.com/remarkjs/remark-toc) plugin.

> [!NOTE]
> Currently, there are no planned improvements or known bugs. If you encounter any issues, please report them on our [issues page](https://github.com/mearashadowfax/Gruntworks/issues) or [start a discussion](https://github.com/mearashadowfax/Gruntworks/discussions/new/choose) to share ideas, suggestions, or ask questions.

## Getting Started

This guide will provide you with the necessary steps to set up and familiarize yourself with the Astro project on your local development machine.

### Use This Template

To get started, click the `Use this template` button (the big green one at the top right) to create your own repo from this template in your GitHub account.

### Clone the Repository

Once your repository is created, you can clone it to your local machine using the following commands:

```bash
git clone https://github.com/[YOUR_USERNAME]/[YOUR_REPO_NAME].git
cd [YOUR_REPO_NAME]
```

### Installation

Start by installing the project dependencies. Open your terminal, navigate to the project's root directory, and execute:

```bash
npm install
```

This command will install all the necessary dependencies defined in the `package.json` file.

### Email Service Setup

Copy `.env.example` to `.env` and fill in your values. For email, sign up at Resend, verify your domain, and add the API key. Ensure SPF, DKIM, and DMARC records are set up for compliance.

### Development Commands

With dependencies installed, you can utilize the following npm scripts to manage your project's development lifecycle:

- `npm run dev`: Starts a local development server with hot reloading enabled.
- `npm run preview`: Serves your build output locally for preview before deployment.
- `npm run build`: Bundles your site into static files for production.

For detailed help with Astro CLI commands, visit [Astro's documentation](https://docs.astro.build/en/reference/cli-reference/).

## Deployment

### Building Your Site

Before deployment, you need to create a production build:

```bash
npm run build
```

This creates a `dist/` directory with your built site (configurable via [outDir in Astro](https://docs.astro.build/en/reference/configuration-reference/#outdir)).

### Deploying to Vercel

Click the button below to start deploying your project on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmearashadowfax%2FGruntworks)

### Deploying to Netlify

Click the button below to start deploying your project on Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mearashadowfax/Gruntworks)

## Project Structure

Gruntworks organizes modular components, content, and layouts to streamline development and content management.

```md
src/
├── assets/  
│ ├── scripts/ # JS scripts
│ └── styles/ # CSS styles
├── components/ # Reusable components
│ ├── Meta.astro # Meta component for SEO
│ ├── sections/ # Components for various sections of the website
│ ├── ThemeIcon.astro # Component for toggling light/dark themes
│ └── ui/ # UI components categorized by functionality
├── content/ # Markdown files for blog posts, insights, products, and site configuration
│ ├── blog/
│ ├── docs/  
│ ├── insights/  
│ └── products/  
├── data_files/ # Strings stored as JSON files
├── images/ # Static image assets for use across the website
├── layouts/ # Components defining layout templates
│ └── MainLayout.astro # The main wrapping layout for all pages
├── pages/ # Astro files representing individual pages and website sections
│ ├── 404.astro # Custom 404 page
│ ├── blog/  
│ ├── contact.astro  
│ ├── index.astro # The landing/home page
│ ├── insights/  
│ ├── products/  
│ ├── robots.txt.ts # Dynamically generates robots.txt
│ └── services.astro
├── utils/ # Shared utility functions and helpers
└── content.config.ts # Contains content collections configuration options
```

## Static Assets and Public Resources

Static files served directly to the browser are within the `public` directory at the root of the project.

```md
public/
└── banner-pattern.svg
```

## Customization

Gruntworks allows for easy customization to suit your specific needs. Here are a couple of ways you can configure components and content:

### Editing Component Variables

Some components have properties defined as TypeScript variables within the component file. Here's an example of customizing the `FeaturesGeneral` component:

```typescript
// Define the string variables title and subTitle for the main heading and sub-heading text.
const title: string = "Meeting Industry Demands";
const subTitle: string =
  "At Gruntworks, we tackle the unique challenges encountered in the hardware and construction sectors.";
```

For collections of content like testimonials or statistics, edit the corresponding array of objects:

```typescript
// An array of testimonials
const testimonials: Testimonial[] = [...];

// An array of statistics
const statistics: StatProps[] = [...];
```

Modify the content within these arrays to reflect your data.

### Props in Component Instances

You can pass values to props directly in the page files for components used across pages. Here's an example of a `HeroSection` and `ClientsSection` component with inline props:

```html
<HeroSection
  subTitle="Top-quality hardware tools and expert construction services for every project need."
  primaryBtn="Start Exploring"
  primaryBtnURL="/explore"
/>

<ClientsSection
  title="Trusted by Industry Leaders"
  subTitle="Experience the reliability chosen by industry giants."
/>
```

Edit the props such as `title`, `subTitle`, `primaryBtn`, etc., to personalize these sections. Ensure that you maintain the structure and data types of the props.

### Customizing Navigation and Footer Links

Edit the `navigation.ts` file within the `utils` directory to manage navigation bar and footer links:

#### Navigation Bar Links

Edit the `navBarLinks` array to adjust navigation bar links:

```typescript
// An array of links for the navigation bar
export const navBarLinks: NavLink[] = [
  { name: "Home", url: "/" },
  { name: "Products", url: "/products" },
  { name: "Services", url: "/services" },
  { name: "Blog", url: "/blog" },
  { name: "Contact", url: "/contact" },
];
```

Replace `name` with the display text and `url` with the appropriate path to pages on your site.

#### Footer Links

Similarly, adjust the links displayed in the footer by editing the `footerLinks` array:

```typescript
// An array of links for the footer
export const footerLinks: FooterLinkSection[] = [
  {
    section: "Product",
    links: [
      { name: "Tools & Equipment", url: "/tools-equipment" },
      { name: "Construction Services", url: "/construction-services" },
      { name: "Pricing", url: "/pricing" },
    ],
  },
  {
    section: "Company",
    links: [
      { name: "About us", url: "/about" },
      { name: "Blog", url: "/blog" },
      { name: "Careers", url: "/careers" },
      { name: "Customers", url: "/customers" },
    ],
  },
];
```

Each section within the `footerLinks` array represents a group of links. Update the `section` value for the group heading and modify each link's `name` and `url` as needed.

#### Social Media Links

Replace the placeholder URLs in the `socialLinks` object with your social media profiles:

```typescript
// An object of links for social icons
export const socialLinks: SocialLinks = {
  facebook: "#",
  twitter: "#",
  github: "#",
  linkedin: "#",
  instagram: "#",
};
```

> [!NOTE]
> Remember to add complete and valid URLs for the navigation to function properly. These customizations will reflect throughout your Astro site, promoting consistency across all pages.

#### Additional Components

We have two options for the navigation bar components: `Navbar.astro` for a regular navbar and `NavbarMegaMenu.astro` for a mega menu. Both are located in `src/components/sections/navbar&footer`.

The `Navbar.astro` and `NavbarMegaMenu.astro` components can be configured within `MainLayout.astro`, allowing you to choose the style of navigation that best suits your project. To customize these components, you can modify them directly under `src/components/sections/navbar&footer` to apply specific configurations or design updates.

![Gruntworks MegaMenu](https://github.com/user-attachments/assets/690482af-f1a4-4ebf-be58-eca0b5862973)

## Integrations and Enhancements

### Starlight Documentation

Gruntworks is now equipped with Starlight, designed to elevate the user experience with documentation. This modern and elegant theme includes a suite of features to make content more accessible and enjoyable to navigate.

Key Features:

- **Automatic Sidebar Navigation**: Starlight automatically generates a sidebar based on your project's structure, making it easy to navigate through your documentation.
- **Search**: Algolia-based search functionality allows users to quickly find the information they need.
- **Dark Mode**: Supports a dark mode for better readability in low-light environments.
- **Code Highlighting**: Code blocks are highlighted for better readability.
- **Markdown and MDX Support**: Write your documentation in Markdown or MDX, allowing for more flexibility and customization.
- **Responsive Design**: The documentation is fully responsive and works on all devices.

With Starlight, you gain access to powerful features and integrations, as well as extensive customization options to suit your needs.

> [!NOTE]
> Dive into the Starlight's comprehensive feature list and learn how it can streamline your development process by visiting the theme's [documentation site](https://starlight.astro.build/).

> [!IMPORTANT]  
> If the sidebar in your Starlight site is not scrolling, and you have to manually drag the scrollbar, remove the script tag related to the Lenis smooth scroll library from `src/components/ui/starlight/Head.astro`.

### Lenis for Smooth Scrolling

Experience buttery smooth scrolling with [Lenis](https://lenis.studiofreight.com/). We've integrated Lenis to provide an enhanced scrolling experience that's both fluid and responsive.

Here's how we set up Lenis in `src/assets/scripts/lenisSmoothScroll.js`:

```js
// src/assets/scripts/lenisSmoothScroll.js
import "@styles/lenis.css";

import Lenis from "lenis";

const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

And then add it to `MainLayout.astro`:

```astro
<script>
  import "@scripts/lenisSmoothScroll.js";
</script>
```

Please note that smooth scrolling can affect accessibility and performance on some devices, so be sure to test it comprehensively across different environments.

> [!NOTE]
> If you would like to remove Lenis and return to the browser's default scrolling behavior, simply comment out or delete these lines from the `MainLayout.astro` file and `/starlight/Head.astro` if you are using Docs.

### GSAP Integration

For individual product pages, [GSAP](https://gsap.com/) has been integrated to add engaging animations that execute as soon as the product page loads. You can find and modify the GSAP configuration in the script sections of the product page file located at `src/pages/products/[id].astro` and the insights page at `src/pages/insights/[id].astro`:

```astro
<script>
  import { gsap } from "gsap";
  // Initialize GSAP animations...
</script>
```

**Customizing Animations:**

Please tailor the GSAP animations within this script to fit your project's look and feel. The provided example is a starting point, representing how to leverage GSAP for immediate visual impact as a product page loads.

**Modifying or Removing Animations:**

- To modify an animation, update the properties and parameters within the `gsap.from()` method, or add new GSAP animation calls as required.
- Should GSAP not be needed, or if you prefer a different animation method, simply remove the aforementioned script segment.

> [!NOTE]
> We've chosen to keep the integration lean and focused, but GSAP's comprehensive documentation can be referred to for more complex animations: [GSAP Documentation](https://gsap.com/docs/v3/).

### Hiding Scrollbar

To achieve a cleaner and more spacious design, the default scrollbar has been visually removed. While this choice fits the aesthetic goals of the project, it's important to consider that hiding scrollbars can sometimes affect accessibility and user experience. We recommend evaluating this design decision within the context of your user base and their needs.

For those who prefer custom-styled scrollbars, we suggest using the [tailwind-scrollbar](https://adoxography.github.io/tailwind-scrollbar/) plugin, which adds Tailwind CSS utilities for scrollbar styles, allowing for more controlled customization that can also meet accessibility standards.

> [!NOTE]
> If you wish to return the default scrollbar, you can comment out or remove the following CSS from `src/layouts/MainLayout.astro`:

```html
<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
```
