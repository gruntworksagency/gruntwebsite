RIPER·Ω₃ Active [Session: 2]

────────────────────────────────────────────────────
INTEGRATED BLUEPRINT – “UNIFIED DATA HUB” ENHANCEMENT
────────────────────────────────────────────────────

0. PURPOSE (unchanged)  
   • Consolidate all site data into a single, type-safe collection (`siteData`) using Zod’s `discriminatedUnion`.  
   • Reduce boilerplate, simplify future data additions, and keep authoring workflow consistent.

1. HIGH-LEVEL PHASES – UPDATED  
   P1 Data Model & Authoring (now includes Unified Data Hub)  
   P2 Page & Component Refactor  
   P3 Build Pipeline Upgrade  
   P4 Image / Asset Optimisation  
   P5 DX Automation  
   P6 QA & Roll-out

2. DETAILED TASKS (only changed or added items shown)

2.1 DATA MODEL (P1) – **REPLACED SECTION**

• **PRE-REQUISITE: Restructure JSON Data**
– Transform `src/data_files/faqs.json` from an object `{ "subTitle": "...", "faqs": [...] }` into a root-level array `[...]` of FAQ objects. The `subTitle` should be moved to the component consuming this data.
– Transform `src/data_files/pricing.json` from an object `{ "title": "...", "products": [...] }` into a root-level array `[...]` of product objects. The metadata (`title`, `subTitle`, etc.) should be moved to the component consuming this data.
– `src/data_files/features.json` is already in the correct format (root-level array) and requires no change.

• Create a new `siteData` collection in `src/content.config.ts`:
– `loader: glob({ pattern: "**/*.json", base: "./src/data_files" })`
– Zod schema = `z.discriminatedUnion("type", [faqSchema, featureSchema, pricingSchema])`.

• Add a `"type"` discriminator to each JSON object:  
 – `faqs.json` → every item gets `"type": "faq"`.  
 – `features.json` → `"type": "feature"`.  
 – `pricing.json` → `"type": "pricing"`.

• Remove separate collection creation for `faqs`, `features`, `pricing` (superseded).

• OPTIONAL: introduce `generateId()` in loader if stable IDs required.

• Blog migration tasks remain unchanged.

2.2 PAGES & COMPONENTS (P2) – **ADJUSTED**

• Replace direct JSON imports with `getCollection("siteData")`, then filter by `entry.data.type`.  
 – `index.astro` and `heatworks-demo.astro` now destructure:
`     const siteData = await getCollection("siteData");
    const faqs = siteData.filter(e => e.data.type === "faq");
    `
• Update any related helper functions to accept unified entry shape.

3. CONTEXTUAL NOTES & RISKS – **ADDED ITEMS**

• Unified schema increases initial complexity; rigorous unit tests recommended for discriminated union parser.  
• Adding future data types = append new schema + literal `"type"` value; no extra collection needed.

4. FUTURE EXTENSIONS (unchanged, still valid)

───────────────────────────────────────────────
ACTION PLAN CHECKLIST (supersedes previous list):

1. [Install astro-compress and remove old compressor & script]
2. [Restructure faqs.json and pricing.json to be root-level arrays, moving metadata to consuming components]
3. [Create unified `siteData` collection in src/content.config.ts with discriminatedUnion schema]
4. [Add `"type"` discriminator to all objects in faqs.json, features.json, pricing.json]
5. [Migrate JSON files (if desired) into src/data_files/; ensure loader path matches]
6. [Refactor index.astro and heatworks-demo.astro to query siteData via getCollection()]
7. [Rewrite blog schema & move post bodies into Markdown; update [id].astro to <Content/>]
8. [Move images to src/assets and replace <img> with <Image/> / <Picture/>]
9. [Update astro.config.mjs with astro-compress integration settings]
10. [bun add -d husky lint-staged prettier; bunx husky init; add pre-commit hook]
11. [Add lint-staged config & prepare script to package.json]
12. [Run bunx astro check, fix type issues, commit]
13. [Merge to main & monitor production metrics]

Plan updated with Unified Data Hub inclusion.
