RIPER·Ω₃ Active [Session: Audit-Form-Enhancements]

────────────────────────────────────────
**COMPREHENSIVE TECHNICAL PLAN**  
Audit Form UI/UX Enhancements & Validation
────────────────────────────────────────

## A. GOALS

1. **Enhanced User Experience**: Add clear functionality to Google Places autocomplete input with visual "X" button
2. **Form State Management**: Automatically clear business information fields when Places autocomplete is cleared
3. **Visual Consistency**: Replace basic submit button with PrimaryCTA styling (orange theme, proper padding, icons)
4. **Form Validation**: Prevent form submission unless a business is selected via Google Places
5. **Minimal Header Design**: Create clean, logo-only header for audit page (no navigation clutter)

## B. ARCHITECTURE OVERVIEW

**Component Enhancement Approach**:

- Extend existing `PlacesAutocomplete` component with clear button functionality
- Add state management for coordinated field clearing
- Implement client-side form validation with visual feedback
- Create new `AuditLayout` as alternative to `MainLayout`
- Maintain existing Google Places API integration while adding UX improvements

**Validation Strategy**:

- Client-side validation prevents submission when `place-id` is empty
- Visual feedback shows validation state (disabled/enabled submit button)
- Progressive enhancement ensures form still works without JavaScript

## C. FILES/COMPONENTS TO CREATE OR MODIFY

### New Files

1. `src/layouts/AuditLayout.astro` - Logo-only layout for audit page
2. `src/components/ui/buttons/ClearButton.astro` - Reusable clear button component

### Modified Files

1. `src/components/PlacesAutocomplete.astro` - Add clear button integration
2. `src/components/PlacesAutocomplete.ts` - Add clear functionality and field management
3. `src/pages/audit.astro` - Switch to AuditLayout, update submit button, add validation
4. `src/types/places.ts` - Add clear callback type definition

### Styling Updates

1. Enhanced PlacesAutocomplete CSS for clear button positioning
2. Form validation styles for submit button states
3. AuditLayout minimal header styling

## D. DETAILED IMPLEMENTATION PLAN

### D-1: Clear Button Component

**Component Structure**:

```astro
---
export interface Props {
  inputId: string;
  onClear?: string; // JavaScript callback function name
  class?: string;
}

const { inputId, onClear = "clearField", class: className = "" } = Astro.props;
---

<!-- src/components/ui/buttons/ClearButton.astro -->
<button
  type="button"
  id={`${inputId}-clear`}
  class={`clear-input-btn ${className}`}
  onclick={`${onClear}('${inputId}')`}
  aria-label="Clear field"
  style="display: none;"
>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
</button>
```

### D-2: Enhanced PlacesAutocomplete Component

**Updated Structure**:

```astro
---
import ClearButton from "../ui/buttons/ClearButton.astro";

export interface Props {
  inputId?: string;
  placeholder?: string;
  required?: boolean;
  onPlaceSelected?: string;
  onClear?: string;
  class?: string;
}

const {
  inputId = "business-search",
  placeholder = "Search for your business...",
  required = false,
  onPlaceSelected = "handlePlaceSelection",
  onClear = "clearBusinessFields",
  class: className = "",
} = Astro.props;
---

<!-- src/components/PlacesAutocomplete.astro -->
<div class="places-autocomplete-container">
  <div class="input-wrapper">
    <input
      type="text"
      id={inputId}
      placeholder={placeholder}
      required={required}
      class={`places-autocomplete-input ${className}`}
      autocomplete="off"
    />
    <ClearButton
      inputId={inputId}
      onClear={onClear}
      class="absolute top-1/2 right-3 -translate-y-1/2 transform"
    />
  </div>
  <div id={`${inputId}-results`} class="places-results"></div>
</div>
```

### D-3: Enhanced PlacesAutocomplete TypeScript Logic

**Extended Functionality** (`src/components/PlacesAutocomplete.ts`):

```typescript
export class PlacesAutocomplete {
  private autocomplete!: google.maps.places.Autocomplete;
  private inputElement: HTMLInputElement;
  private clearButton: HTMLButtonElement | null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isLoading: boolean = false;

  constructor(inputElement: HTMLInputElement) {
    this.inputElement = inputElement;
    this.clearButton = document.getElementById(
      `${inputElement.id}-clear`,
    ) as HTMLButtonElement;
    this.initializeAutocomplete(inputElement);
    this.addLoadingStates();
    this.setupClearFunctionality();
  }

  private setupClearFunctionality(): void {
    // Show/hide clear button based on input content
    this.inputElement.addEventListener("input", () => {
      this.toggleClearButton();
    });

    // Handle clear button click
    if (this.clearButton) {
      this.clearButton.addEventListener("click", () => {
        this.clearField();
      });
    }
  }

  private toggleClearButton(): void {
    if (this.clearButton) {
      if (this.inputElement.value.trim() !== "") {
        this.clearButton.style.display = "block";
      } else {
        this.clearButton.style.display = "none";
      }
    }
  }

  public clearField(): void {
    // Clear the input
    this.inputElement.value = "";

    // Hide clear button
    if (this.clearButton) {
      this.clearButton.style.display = "none";
    }

    // Clear business fields
    this.clearBusinessFields();

    // Clear Google Places selection
    if (this.autocomplete) {
      this.autocomplete.set("place", null);
    }

    // Update form validation state
    this.updateFormValidation();

    // Focus back to input
    this.inputElement.focus();
  }

  private clearBusinessFields(): void {
    const fieldIds = [
      "business-name",
      "business-address",
      "business-phone",
      "business-website",
      "place-id",
      "google-business-url",
      "business-types",
    ];

    fieldIds.forEach((fieldId) => {
      const field = document.getElementById(fieldId) as HTMLInputElement;
      if (field) {
        field.value = "";
        field.classList.remove("field-populated");
      }
    });

    // Call global clear callback if available
    if (window.clearBusinessFields) {
      window.clearBusinessFields();
    }
  }

  private updateFormValidation(): void {
    const submitButton = document.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    const placeIdField = document.getElementById(
      "place-id",
    ) as HTMLInputElement;

    if (submitButton && placeIdField) {
      const hasValidPlace = placeIdField.value.trim() !== "";
      submitButton.disabled = !hasValidPlace;

      if (hasValidPlace) {
        submitButton.classList.remove("opacity-50", "cursor-not-allowed");
        submitButton.classList.add("cursor-pointer");
      } else {
        submitButton.classList.add("opacity-50", "cursor-not-allowed");
        submitButton.classList.remove("cursor-pointer");
      }
    }
  }

  private handlePlaceSelection(): void {
    const place = this.autocomplete.getPlace();
    if (!place.place_id) {
      console.warn("No place selected or place_id missing");
      this.updateFormValidation();
      return;
    }

    const placeData: PlaceData = this.extractPlaceData(place as GooglePlace);
    this.populateForm(placeData);

    // Show clear button after selection
    this.toggleClearButton();

    // Update validation state
    this.updateFormValidation();

    // Call global callback if available
    if (window.populateBusinessFields) {
      window.populateBusinessFields(placeData);
    }
  }
}
```

### D-4: AuditLayout Component

**Minimal Layout Structure**:

```astro
---
import Meta from "@components/Meta.astro";
import HeatLogo from "@components/HeatLogo.astro";
import { SITE } from "@data/constants";
import "@styles/global.css";
import "@fontsource-variable/inter";

const {
  title = SITE.title,
  meta,
  structuredData,
  lang = "en",
  customDescription = null,
  customOgTitle = null,
} = Astro.props;

interface Props {
  title?: string;
  meta?: string;
  structuredData?: object;
  lang?: string;
  customDescription?: string | null;
  customOgTitle?: string | null;
}
---

<!-- src/layouts/AuditLayout.astro -->
<html lang={lang} class="scrollbar-hide lenis lenis-smooth scroll-pt-16">
  <head>
    <Meta
      meta={meta}
      structuredData={structuredData}
      customDescription={customDescription}
      customOgTitle={customOgTitle}
    />
    <title>{title}</title>
    <script is:inline>
      if (
        localStorage.getItem("hs_theme") === "dark" ||
        (!("hs_theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    </script>
    <script>
      import "@scripts/lenisSmoothScroll.js";
    </script>
  </head>
  <body
    class="flex min-h-screen flex-col bg-neutral-200 bg-neutral-800 selection:bg-yellow-400 selection:text-neutral-700"
  >
    <!-- Minimal Header with Logo Only -->
    <header class="fixed inset-x-0 top-4 z-50 flex w-full justify-center">
      <div
        class="rounded-[36px] border border-yellow-100/40 bg-yellow-50/60 px-6 py-3 backdrop-blur-md"
      >
        <a
          class="flex-none rounded-lg text-xl font-bold ring-zinc-500 outline-hidden focus-visible:ring-3"
          href="/"
          aria-label="Return to homepage"
        >
          <HeatLogo />
        </a>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <script>
      import "preline/preline.js";
    </script>

    <style>
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    </style>
  </body>
</html>
```

### D-5: Enhanced Audit Form

**Updated Form Structure**:

```astro
---
import AuditLayout from "@/layouts/AuditLayout.astro";
import PlacesAutocomplete from "../components/PlacesAutocomplete.astro";
import PrimaryCTA from "../components/ui/buttons/PrimaryCTA.astro";
import { auth } from "../lib/auth";

export const prerender = false;

const session = await auth.api.getSession({
  headers: Astro.request.headers,
});

const pageTitle: string = "Audit Contact Request";
const metaDescription: string = "Submit your information for an audit request.";
---

<!-- src/pages/audit.astro -->
<AuditLayout title={pageTitle} customDescription={metaDescription}>
  <section class="mx-auto bg-neutral-200 px-4 pt-[150px] pb-10">
    <div class="mx-auto max-w-2xl">
      <!-- Existing content structure... -->

      <form method="POST" id="audit-form">
        <div class="grid gap-6">
          <!-- Business Search Section -->
          <div class="business-search-section">
            <label
              for="business-search"
              class="mb-2 block text-sm font-medium text-neutral-700"
            >
              Search for your business
            </label>
            <PlacesAutocomplete
              inputId="business-search"
              placeholder="Start typing your business name..."
              onPlaceSelected="populateBusinessFields"
              onClear="clearBusinessFields"
            />
            <p class="mt-1 text-xs text-neutral-500">
              Select your business from Google to auto-fill details below
            </p>
          </div>

          <!-- Existing form fields... -->
        </div>

        <!-- Enhanced Submit Button -->
        <div class="mt-6 flex justify-center">
          <button
            type="submit"
            id="submit-btn"
            class="group inline-flex cursor-not-allowed items-center justify-center gap-x-2 rounded-[7px] border border-transparent bg-orange-400 px-6 py-4 text-sm font-bold text-neutral-50 opacity-50 ring-zinc-500 outline-hidden transition duration-300 hover:bg-orange-500 focus:outline-hidden focus-visible:ring-3 active:bg-orange-500 disabled:pointer-events-none disabled:opacity-50"
            disabled
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Submit Request
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  </section>
</AuditLayout>
```

### D-6: Enhanced Type Definitions

**Extended Types** (`src/types/places.ts`):

```typescript
// Add to existing types
declare global {
  interface Window {
    initPlacesAutocomplete: () => void;
    populateBusinessFields: (placeData: PlaceData) => void;
    clearBusinessFields: () => void;
  }
}

export interface PlacesAutocompleteCallbacks {
  onPlaceSelected?: (placeData: PlaceData) => void;
  onClear?: () => void;
  onValidationChange?: (isValid: boolean) => void;
}
```

### D-7: Form Validation and State Management

**Client-Side Validation Logic**:

```javascript
// Enhanced validation in audit.astro script section
window.clearBusinessFields = function () {
  // Clear all business information fields
  const fieldIds = [
    "business-name",
    "business-address",
    "business-phone",
    "business-website",
    "place-id",
    "google-business-url",
    "business-types",
  ];

  fieldIds.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = "";
      field.style.borderColor = "";
      field.style.backgroundColor = "";
    }
  });

  // Update submit button state
  updateSubmitButtonState();
};

function updateSubmitButtonState() {
  const submitButton = document.getElementById("submit-btn");
  const placeIdField = document.getElementById("place-id");

  if (submitButton && placeIdField) {
    const hasValidPlace = placeIdField.value.trim() !== "";
    submitButton.disabled = !hasValidPlace;

    if (hasValidPlace) {
      submitButton.classList.remove("opacity-50", "cursor-not-allowed");
      submitButton.classList.add("cursor-pointer");
    } else {
      submitButton.classList.add("opacity-50", "cursor-not-allowed");
      submitButton.classList.remove("cursor-pointer");
    }
  }
}

// Enhanced populateBusinessFields to update validation
window.populateBusinessFields = function (placeData) {
  // Existing population logic...

  // Update submit button state after population
  updateSubmitButtonState();
};

// Form submission validation
document.getElementById("audit-form")?.addEventListener("submit", function (e) {
  const placeIdField = document.getElementById("place-id");
  if (!placeIdField || !placeIdField.value.trim()) {
    e.preventDefault();
    alert(
      "Please select your business from the Google search suggestions before submitting.",
    );
    return false;
  }
});
```

### D-8: Enhanced Styling

**Additional CSS Enhancements**:

```css
/* src/components/PlacesAutocomplete.astro - Enhanced styles */
.input-wrapper {
  position: relative;
  width: 100%;
}

.clear-input-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 10;
}

.clear-input-btn:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.clear-input-btn:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  ring-offset: 1px;
}

.places-autocomplete-input {
  padding-right: 40px; /* Make room for clear button */
}

/* Submit button validation states */
.submit-btn-valid {
  @apply cursor-pointer bg-orange-400 opacity-100 hover:bg-orange-500;
}

.submit-btn-invalid {
  @apply cursor-not-allowed bg-gray-400 opacity-50;
}

/* AuditLayout header styling */
.audit-header {
  backdrop-filter: blur(12px);
  background: rgba(254, 243, 199, 0.6);
  border: 1px solid rgba(254, 240, 138, 0.4);
}
```

## E. TESTING AND VALIDATION

### E-1: Functionality Testing

1. **Clear Button Behavior**:
   - Button appears when input has content
   - Button disappears when input is empty
   - Clicking clear button empties input and business fields
   - Clear button has proper accessibility attributes

2. **Form Validation**:
   - Submit button disabled when no business selected
   - Submit button enabled after business selection
   - Form prevents submission without valid place_id
   - Visual feedback shows validation state

3. **Layout Testing**:
   - AuditLayout shows only logo in header
   - Logo links back to homepage
   - Responsive behavior on mobile devices

### E-2: UX Testing

1. **User Flow**:
   - Clear and intuitive clear functionality
   - Smooth transitions between states
   - Consistent visual feedback
   - Accessible keyboard navigation

## F. ACTION PLAN CHECKLIST

### Phase 1: Core Component Development

- [ ] 1. Create `src/components/ui/buttons/ClearButton.astro` with SVG X icon
- [ ] 2. Update `src/components/PlacesAutocomplete.astro` to include ClearButton
- [ ] 3. Enhance `src/components/PlacesAutocomplete.ts` with clear functionality
- [ ] 4. Add clear button positioning and styling CSS
- [ ] 5. Test clear button appears/disappears correctly

### Phase 2: Layout Creation

- [ ] 6. Create `src/layouts/AuditLayout.astro` with minimal header
- [ ] 7. Import and position HeatLogo component
- [ ] 8. Style header container with backdrop blur and borders
- [ ] 9. Test logo links back to homepage correctly
- [ ] 10. Verify responsive behavior on mobile

### Phase 3: Form Enhancement

- [ ] 11. Update `src/pages/audit.astro` to use AuditLayout
- [ ] 12. Replace submit button with PrimaryCTA styling
- [ ] 13. Add form validation JavaScript
- [ ] 14. Implement `clearBusinessFields()` global function
- [ ] 15. Test form validation prevents submission without business

### Phase 4: Field Clearing Logic

- [ ] 16. Implement business field clearing when autocomplete cleared
- [ ] 17. Add visual feedback for field clearing
- [ ] 18. Test clear button clears all related fields
- [ ] 19. Verify form state updates after clearing
- [ ] 20. Test keyboard accessibility for clear functionality

### Phase 5: Submit Button Styling

- [ ] 21. Apply PrimaryCTA orange color scheme to submit button
- [ ] 22. Add zap and arrow icons to submit button
- [ ] 23. Implement disabled/enabled state styling
- [ ] 24. Add proper focus and hover states
- [ ] 25. Test button accessibility and keyboard navigation

### Phase 6: Integration Testing

- [ ] 26. Test complete user flow from search to submit
- [ ] 27. Verify all clearing functionality works together
- [ ] 28. Test form submission with and without business selection
- [ ] 29. Verify visual consistency across all components
- [ ] 30. Test responsive behavior on various screen sizes

### Phase 7: Type Safety and Documentation

- [ ] 31. Update `src/types/places.ts` with new callback types
- [ ] 32. Add TypeScript interfaces for new component props
- [ ] 33. Test all TypeScript compilation passes
- [ ] 34. Verify no console errors or warnings
- [ ] 35. Document new component usage patterns

<!-- README_SNIPPET_START
### Enhanced Audit Form Experience

The audit request form now features a streamlined, professional interface with intelligent business search capabilities and improved user experience:

**Key Enhancements:**
- **Smart Clear Functionality**: One-click clear button (X) appears in the business search field when populated, instantly clearing both the search and all related business information
- **Form Validation**: Submit button remains disabled until a business is properly selected from Google Places suggestions, ensuring accurate data capture
- **Premium Button Styling**: Professional orange CTA button with icons matches the site's premium design language
- **Minimal Header Design**: Clean, logo-only header removes distractions and focuses attention on the form completion process

**User Benefits:**
- **Faster Corrections**: Quickly start over with business search without manually clearing multiple fields
- **Error Prevention**: Cannot accidentally submit incomplete business information
- **Professional Appearance**: Consistent styling throughout the form experience
- **Focused Experience**: Distraction-free header keeps users focused on completing their audit request

Perfect for businesses seeking a polished, error-free audit request process with verified Google business data.
README_SNIPPET_END -->

────────────────────────────────────────

**PLAN COMPLETE**

This comprehensive plan delivers all requested enhancements to the audit form:

1. **Clear Button**: Integrated "X" button in Google Places input with coordinated field clearing
2. **Business Field Clearing**: Automatic clearing of all business information when autocomplete is reset
3. **PrimaryCTA Styling**: Professional orange submit button with icons and proper states
4. **Form Validation**: Client-side validation preventing submission without valid business selection
5. **Minimal Header**: Clean AuditLayout with logo-only header design

The implementation maintains existing Google Places functionality while adding significant UX improvements through coordinated state management, visual feedback, and professional styling. All components work together seamlessly to create a polished, error-free audit request experience.
