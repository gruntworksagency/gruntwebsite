import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import compressor from "astro-compressor";
import starlight from "@astrojs/starlight";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  // https://docs.astro.build/en/guides/images/#authorizing-remote-images
  site: "https://screwfast.uk",
  image: {
    domains: ["images.unsplash.com"],
  },
  prefetch: true,
  integrations: [sitemap({}), starlight({
    title: "ScrewFast Docs",
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
      { icon: "github", label: "GitHub", href: "https://github.com/mearashadowfax/ScrewFast" },
    ],
    disable404Route: true,
    customCss: ["./src/assets/styles/starlight.css"],
    favicon: "/favicon.ico",
    components: {
      SiteTitle: "./src/components/ui/starlight/SiteTitle.astro",
      Head: "./src/components/ui/starlight/Head.astro",
      MobileMenuFooter: "./src/components/ui/starlight/MobileMenuFooter.astro",
      ThemeSelect: "./src/components/ui/starlight/ThemeSelect.astro",
    },
    head: [
      {
        tag: "meta",
        attrs: {
          property: "og:image",
          content: "https://screwfast.uk" + "/social.webp",
        },
      },
      {
        tag: "meta",
        attrs: {
          property: "twitter:image",
          content: "https://screwfast.uk" + "/social.webp",
        },
      },
    ],
  }), compressor({
    gzip: false,
    brotli: true,
  }), mdx()],
  experimental: {
    clientPrerender: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
