import ogImageSrc from "@images/social.png";



export const SITE = {
  title: "Gruntworks",
  tagline: "Top-quality Hardware Tools",
  description: "Gruntworks offers top-tier hardware tools and expert construction services to meet all your project needs. Start exploring and contact our sales team for superior quality and reliability.",
  description_short: "Gruntworks offers top-tier hardware tools and expert construction services to meet all your project needs.",
  url: "https://gruntworksagency.com",
  author: "Chris",
  ogImage: "/assets/og-image.jpg",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: : Hardware Tools & Construction Services`,
  description: "Equip your projects with Gruntworks's top-quality hardware tools and expert construction services. Trusted by industry leaders, Gruntworks offers simplicity, affordability, and reliability. Experience the difference with user-centric design and cutting-edge tools. Start exploring now!",
  image: ogImageSrc,
};

export const partnersData = [
    {
        icon: ``,
        name: "first",
        href: "#",
    },
    {
        icon: ``,
        name: "Second",
        href: "#",
    },
    {
        icon: ``,
        name: "Third",
        href: "#",
    },

    {
        icon: ``,
        name: "Fourth",
        href: "#",
    },
]

export const AppConfig = {
  name: "Gruntworks",
  // ... existing code ...
};