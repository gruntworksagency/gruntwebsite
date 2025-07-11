// https://docs.astro.build/en/guides/content-collections/#defining-collections

import { z, defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

const productsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    main: z.object({
      id: z.number(),
      content: z.string(),
      imgCard: image(),
      imgMain: image(),
      imgAlt: z.string(),
    }),
    tabs: z.array(
      z.object({
        id: z.string(),
        dataTab: z.string(),
        title: z.string(),
      })
    ),
    longDescription: z.object({
      title: z.string(),
      subTitle: z.string(),
      btnTitle: z.string(),
      btnURL: z.string(),
    }),
    descriptionList: z.array(
      z.object({
        title: z.string(),
        subTitle: z.string(),
      })
    ),
    specificationsLeft: z.array(
      z.object({
        title: z.string(),
        subTitle: z.string(),
      })
    ),
    specificationsRight: z.array(
      z.object({
        title: z.string(),
        subTitle: z.string(),
      })
    ).optional(),
    tableData: z.array(
      z.object({
        feature: z.array(z.string()),
        description: z.array(z.array(z.string())),
      })
    ).optional(),
    blueprints: z.object({
      first: image().optional(),
      second: image().optional(),
    }),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object ({
  title: z.string(),
  description: z.string(),
  contents: z.array(z.string()),
  author: z.string(),
  role: z.string().optional(),
  authorImage: image(),
  authorImageAlt: z.string(),
  pubDate: z.date(),
  cardImage: image(),
  cardImageAlt: z.string(),
  readTime: z.number(),
  tags: z.array(z.string()).optional(),
  }),
});

const insightsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object ({
  title: z.string(),
  description: z.string(),
  cardImage: image(),
  cardImageAlt: z.string(),
  }),
});

const heatworksDemoCollection = defineCollection({
  loader: glob({ pattern: "index.mdx", base: "./src/content/heatworks-demo" }),
  schema: ({ image }) => z.object({
    layout_constants: z.object({
      container_max_width: z.string(),
    }),
    review_section: z.object({
      avatar_srcs: z.array(z.string()),
      review_star_count: z.number(),
      review_rating: z.string(),
      review_reviews: z.string(),
    }),
    features_section: z.object({
      features_general_title: z.string(),
      features_general_sub_title: z.string(),
      features_navs_config: z.object({
        title: z.string(),
        tabs: z.array(z.object({
          heading: z.string(),
          content: z.string(),
          svg: z.string(),
          src: image(),
          alt: z.string(),
          first: z.boolean().optional(),
          second: z.boolean().optional(),
        })),
      }),
    }),
    feature_image: image(),
    hero_section: z.object({
      heatworks_logo: image(),
      cloud_1_min: image(),
      cloud_2_min: image(),
      cloud_3_min: image(),
      ipad: image(),
      video_compressed_2: z.string(), // Changed from image() to z.string()
      grass_transition: z.string(),    // Changed from image() to z.string()
    }),
    background_images: z.object({
      darker_rock_texture: image(),
      grass_repeat: image(),
    }),
    faq_section: z.object({
      faq_title: z.string(),
    }),
    announcement_banner: z.object({
      announcement_banner_btn_title: z.string(),
      announcement_banner_url: z.string().url(),
    }),
    quote_banner: z.object({
      quote_banner_text_1: z.string(),
      quote_banner_text_2: z.string(),
      quote_banner_text_classes: z.string(),
      quote_banner_container_classes: z.string(),
    }),
  }),
});

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  'products': productsCollection,
  'blog': blogCollection,
  'insights': insightsCollection,
  heatworksDemo: heatworksDemoCollection,
};