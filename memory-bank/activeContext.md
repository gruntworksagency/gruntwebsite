RIPER·Ω₃ Active [Session: Footer-Design-Revamp]

Here is the final, comprehensive plan for the "Final-Offer Spotlight Footer," incorporating the necessary prerequisites discovered during research. This plan is now actionable.

══════════════════════════════════════════════════════════
**FINAL COMPREHENSIVE PLAN – “Final-Offer Spotlight Footer”**
══════════════════════════════════════════════════════════

**0. Purpose**
*   Replace the existing multi-column/newsletter footer with a streamlined, conversion-centric “last-call” footer that drives users to the Audit flow while preserving minimal navigation, brand credibility, and social presence.

**1. Affected / New Assets**
*   `src/components/sections/navbar-and-footer/FooterSection.astro` (major rewrite)
*   `src/components/ui/buttons/PrimaryCTA.astro` **(MODIFIED)**
*   `src/components/sections/features/FeaturesGeneral.astro` **(MODIFIED)**
*   `src/components/sections/pricing/PricingSection.astro` **(MODIFIED)**
*   `src/components/sections/misc/FAQ.astro` **(MODIFIED)**
*   `src/utils/navigation.ts` **(MODIFIED)**
*   `src/components/sections/navbar-and-footer/Navbar.astro` **(MODIFIED)**

**2. Visual / Content Structure (Unchanged)**
*   A two-column grid (links left, CTA card right), a horizontal divider, and a bottom bar (copyright left, socials right). The CTA card will be on top when stacked on mobile.

**3. Phased Tasks & Implementation Details**

The implementation is broken into two phases: **Prerequisites** to enable the new design, and **Implementation** to build it.

**PHASE I: PREREQUISITES**

1.  **Enable CTA Styling:**
    *   **File:** `src/components/ui/buttons/PrimaryCTA.astro`
    *   **Action:** Modify the component to accept and merge an external `class` prop to allow for hover animations.
    *   **Example Change:**
        ```astro
        // From:
        const { title, url, noArrow, noZapIcon } = Astro.props;
        // To:
        const { title, url, noArrow, noZapIcon, class: className } = Astro.props;
        
        // In the <a> tag:
        // From:
        class={`${baseClasses} ... ${ringClasses}`}
        // To:
        class={`${baseClasses} ... ${ringClasses} ${className || ''}`}
        ```

2.  **Add Anchor Link Targets:**
    *   **File:** `src/components/sections/features/FeaturesGeneral.astro` -> Add `id="features"` to the root `<section>` element.
    *   **File:** `src/components/sections/pricing/PricingSection.astro` -> Add `id="pricing"` to the root `<section>` element.
    *   **File:** `src/components/sections/misc/FAQ.astro` -> Add `id="faqs"` to the root `<section>` element.

3.  **Centralize Navigation Links:**
    *   **Source File:** `src/components/sections/navbar-and-footer/Navbar.astro`
    *   **Destination File:** `src/utils/navigation.ts`
    *   **Action:**
        a.  Cut the `navBarLinks` array from `Navbar.astro`.
        b.  Paste it into `navigation.ts`, rename it to `landingPageLinks`, and export it.
        c.  Update `Navbar.astro` to import `landingPageLinks` from `@/utils/navigation` and use it.

**PHASE II: IMPLEMENTATION**

4.  **Refactor `FooterSection.astro`:**
    *   **File:** `src/components/sections/navbar-and-footer/FooterSection.astro`
    *   **Action:** Perform the full rewrite:
        a.  Import `landingPageLinks` and `socialLinks` from `@/utils/navigation.ts`.
        b.  Import `PrimaryCTA`, `FooterSocialLink`, `Icon`, and `SITE`.
        c.  Build the two-column grid layout, using `landingPageLinks` to create the navigation list on the left.
        d.  Build the "spotlight" CTA card on the right (`Ready to Optimize?`, etc.).
        e.  Use the now-modifiable `PrimaryCTA` component, passing `class="mt-6 transform transition hover:scale-105"` for the hover effect.
        f.  Add the `<hr>` divider.
        g.  Create the bottom bar with copyright and social links (X and LinkedIn).
        h.  Retain the "current-year" script.

**4. Risks & Mitigations (Revised)**
*   **Modifying a Shared Component (`PrimaryCTA.astro`):** Low risk of affecting other instances. **Mitigation:** QA will include checking other pages where `PrimaryCTA` is used to ensure no visual regressions.
*   **Newsletter Functionality Removal:** Confirmed as an intentional business decision. No technical mitigation needed.
*   **(Resolved) Broken Anchor Links:** The risk is resolved by prerequisite task #2.

══════════════════════════════════════════════════════════
**FINAL ACTION PLAN CHECKLIST**
══════════════════════════════════════════════════════════
1.  **Modify `PrimaryCTA.astro`** to accept and merge a `class` prop.
2.  **Add `id="features"`** to `src/components/sections/features/FeaturesGeneral.astro`.
3.  **Add `id="pricing"`** to `src/components/sections/pricing/PricingSection.astro`.
4.  **Add `id="faqs"`** to `src/components/sections/misc/FAQ.astro`.
5.  **Move `navBarLinks`** from `Navbar.astro` to `src/utils/navigation.ts`, renaming it `landingPageLinks` and exporting it.
6.  **Update `Navbar.astro`** to import and use the new `landingPageLinks`.
7.  **Begin the main refactor of `FooterSection.astro`**:
    a.  Clear the existing file content.
    b.  Import all necessary components and data (`landingPageLinks`, `socialLinks`, `PrimaryCTA`, `SITE`, etc.).
    c.  Build the new two-column layout with the link list and the "spotlight" CTA card.
    d.  Pass the `class` prop for the hover animation to the `PrimaryCTA` component.
    e.  Add the `<hr>` divider and the bottom bar with copyright & socials.
8.  **Run `pnpm lint && pnpm astro check`** (or equivalent) to validate code.
9.  **Perform QA**: Verify responsive behavior, test all links, check for visual regressions, and test the hover animation.
10. **Push branch** and open PR titled “feat: Final-Offer Spotlight Footer”.
11. **Merge** on approval.

══════════════════════════════════════════════════════════
Plan is final and ready for execution.