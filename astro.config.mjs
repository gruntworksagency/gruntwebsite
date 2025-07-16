import { defineConfig, passthroughImageService } from "astro/config";
import { loadEnv } from "vite";

const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PUBLIC_GOOGLE_MAPS_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, MAIL_DOMAIN } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

process.env.DATABASE_URL = DATABASE_URL;
process.env.BETTER_AUTH_SECRET = BETTER_AUTH_SECRET;
process.env.BETTER_AUTH_URL = BETTER_AUTH_URL;
process.env.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID;
process.env.GOOGLE_CLIENT_SECRET = GOOGLE_CLIENT_SECRET;
process.env.PUBLIC_GOOGLE_MAPS_API_KEY = PUBLIC_GOOGLE_MAPS_API_KEY;
process.env.RESEND_API_KEY = RESEND_API_KEY;
process.env.RESEND_FROM_EMAIL = RESEND_FROM_EMAIL;
process.env.MAIL_DOMAIN = MAIL_DOMAIN;

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import starlight from "@astrojs/starlight";
import mdx from "@astrojs/mdx";
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // https://docs.astro.build/en/guides/images/#authorizing-remote-images
  site: "https://gruntworksagency.com",
  image: {
    service: passthroughImageService(),
    domains: ["images.unsplash.com"],
  },
  prefetch: true,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap({}), starlight({
    title: "Gruntworks Docs",
    sidebar: [
      {
        label: "Quick Start Guides",
        autogenerate: { directory: "guides" },
      },
      {
        label: "Tools & Equipment",
        items: [
          { label: "Tool Guides", link: "tools/tool-guides/" },
          { label: "Equipment Care", link: "tools/equipment-care/" },
        ],
      },
      {
        label: "Construction Services",
        autogenerate: { directory: "construction" },
      },
      {
        label: "Advanced Topics",
        autogenerate: { directory: "advanced" },
      },
    ],
    social: [
      { icon: "github", label: "GitHub", href: "https://github.com/mearashadowfax/Gruntworks" },
    ],
    disable404Route: true,
    customCss: ["./src/assets/styles/starlight.css"],
    favicon: "/favicon.ico",
    components: {
      SiteTitle: "./src/components/ui/starlight/SiteTitle.astro",
      Head: "./src/components/ui/starlight/Head.astro",
      MobileMenuFooter: "./src/components/ui/starlight/MobileMenuFooter.astro",
      // ThemeSelect: "./src/components/ui/starlight/ThemeSelect.astro",
    },
    head: [
      {
        tag: "meta",
        attrs: {
          property: "og:image",
          content: "https://gruntworksagency.com" + "/social.webp",
        },
      },
      {
        tag: "meta",
        attrs: {
          property: "twitter:image",
          content: "https://gruntworksagency.com" + "/social.webp",
        },
      },
    ],
  }), // Only run astro-compress in production
  process.env.NODE_ENV === "production" &&
    compress({
      CSS: true,
      HTML: true,
      Image: false,
      JavaScript: true,
      SVG: true,
    }), mdx()],

  vite: {
    plugins: [tailwindcss()],
  },
});