RIPER·Ω₃ Active [Session: auth-setup-1]

### Project Plan: Enable Modern Hybrid Rendering with Node.js Adapter in Astro v5

#### Purpose

Transition the project's configuration from the obsolete `output: 'hybrid'` mode to the modern Astro v5 equivalent by setting `output: 'server'` and integrating the official `@astrojs/node` adapter. This enables a true hybrid setup where pages are server-rendered by default (supporting features like middleware-based authentication gating for /audit), while allowing specific pages to be prerendered as static HTML via frontmatter (e.g., `export const prerender = true;`). The plan ensures seamless dev server startup, maintains existing auth flows (e.g., session checks, redirects), and prepares for production deployment on Node.js-compatible hosts, all without regressions in type safety or functionality from the previous session's fixes.

#### Structure Outline

- **Configuration Updates**: Modify astro.config.mjs to use `output: 'server'` and add the Node.js adapter in standalone mode for local development and preview.
- **Dependency Installation**: Add `@astrojs/node` to package.json and install it.
- **Page-Level Prerendering**: Update key pages (e.g., static ones like index.astro) with prerender directives to maintain hybrid behavior.
- **Dev Server & Build Scripts**: Adjust package.json scripts for seamless dev, build, and preview commands with the new server mode.
- **Testing & Validation**: Verify dev server runs without errors, auth middleware gates routes correctly, and prerendered pages output static files.
- **Documentation**: Update .docs/activeContext.md with the new setup for session continuity.

#### Planned Phases

1. **Dependency Addition**: Install `@astrojs/node` using the project's package manager (Bun, based on scripts in package.json).
2. **Config Refinement**: Remove 'hybrid' from astro.config.mjs, set `output: 'server'`, and configure the Node adapter in standalone mode for easy local running.
3. **Page Adjustments**: Scan and add `prerender: true` to non-dynamic pages to replicate hybrid prerendering; ensure dynamic pages like /login and /audit remain server-rendered.
4. **Script Updates**: Modify "dev", "build", and "preview" scripts in package.json to accommodate server mode (e.g., preview uses Node to run the server output).
5. **Validation**: Run dev server to confirm no config errors; test auth flows, prerendering, and build output.

#### Required Context

- Dependencies: @astrojs/node (^9.0.0, compatible with Astro ^5.10.1); existing auth-astro and other integrations remain unchanged.
- Edge Cases: Handle pages with client-side scripts (ensure client:load directives work in server mode); test middleware redirects without infinite loops; verify TypeScript compilation post-changes (run tsc --noEmit); if deploying, standalone mode outputs a server.mjs file runnable with Node.
- Example Snippet (for illustration only, not final code):
  ```js
  // astro.config.mjs (example adapter config)
  import node from "@astrojs/node";
  export default defineConfig({
    output: "server",
    adapter: node({ mode: "standalone" }),
  });
  ```

ACTION PLAN CHECKLIST:

1. [Install @astrojs/node via `bun add @astrojs/node`.]
2. [Update astro.config.mjs: change output to 'server', import node from '@astrojs/node', and add adapter: node({ mode: 'standalone' }) to the config.]
3. [Scan src/pages for static pages (e.g., index.astro) and add `export const prerender = true;` to their frontmatter if not already present.]
4. [Update package.json scripts: set "preview" to "node dist/server/entry.mjs" for running the standalone server post-build.]
5. [Run `bun run dev` to verify the dev server starts without config errors.]
6. [Test key flows: access /audit unauthenticated (should redirect to /login), login, check personalization, sign out; confirm static pages prerender correctly via build.]
7. [Re-run tsc --noEmit to ensure no new type errors; document changes in .docs/activeContext.md.]

Plan complete. Switch to Execute Agent.
