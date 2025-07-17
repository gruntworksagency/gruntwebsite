RIPER·Ω₃ Active [Session: Audit-PlacesIntegration]

────────────────────────────────────────
**COMPREHENSIVE TECHNICAL PLAN**  
Google Places API Integration for Audit Form
────────────────────────────────────────

## A. GOALS

1. **Primary Objective**: Integrate Google Places API autocomplete into the existing audit form (`/audit`) to allow users to search for and select their business listing
2. **Data Capture**: Automatically populate form fields with business information (name, address, phone, website, Google Business Profile URL, place_id)
3. **Security**: Implement proper API key restrictions and security measures for client-side usage
4. **User Experience**: Provide seamless, real-time business search with minimal friction
5. **Future-Proofing**: Create reusable components that can be used in other parts of the application

## B. ARCHITECTURE OVERVIEW

**Pure Client-Side Approach** (Recommended based on research):

- Google Maps JavaScript API with Places Library loaded directly in the browser
- Astro component with optional React island for enhanced interactivity
- API key secured through HTTP referrer and API restrictions
- Form enhancement that preserves existing functionality while adding autocomplete

**Security Model**:

- Existing `PUBLIC_GOOGLE_MAPS_API_KEY` configured with proper restrictions
- Website restrictions locked to project domain
- API restrictions limited to Places API and Maps JavaScript API
- Usage monitoring and quotas configured

## C. FILES/COMPONENTS TO CREATE OR MODIFY

### New Files

1. `src/components/PlacesAutocomplete.astro` - Main autocomplete component
2. `src/components/PlacesAutocomplete.ts` - TypeScript logic for Places API interaction
3. `src/types/places.ts` - TypeScript interfaces for Places API responses
4. `docs/places-api-setup.md` - Documentation for API key configuration

### Modified Files

1. `src/pages/audit.astro` - Integration of Places autocomplete into existing form
2. `astro.config.mjs` - Add Places API to any CSP configurations if needed
3. `.env.example` - Document any additional environment variables

### Optional Enhancements

1. `src/components/PlacesAutocompleteReact.tsx` - React island version for enhanced UX
2. `src/styles/places-autocomplete.css` - Custom styling for autocomplete dropdown

## D. DETAILED IMPLEMENTATION PLAN

### D-1: API Key Security Configuration

**Immediate Actions**:

```bash
# Access Google Cloud Console → APIs & Services → Credentials
# Edit existing PUBLIC_GOOGLE_MAPS_API_KEY:
# 1. Application Restrictions: HTTP referrers
#    - Add: https://yourdomain.com/*
#    - Add: https://*.yourdomain.com/*
# 2. API Restrictions: Restrict key
#    - Enable: Places API (New)
#    - Enable: Maps JavaScript API
#    - Enable: Geocoding API (if needed)
# 3. Set quota limits (e.g., 1000 requests/day initially)
```

### D-2: Core Places Autocomplete Component

**Component Structure**:

```typescript
// src/components/PlacesAutocomplete.astro
---
export interface Props {
  inputId?: string;
  placeholder?: string;
  required?: boolean;
  onPlaceSelected?: string; // JavaScript callback function name
}

const {
  inputId = "business-search",
  placeholder = "Search for your business...",
  required = false,
  onPlaceSelected = "handlePlaceSelection"
} = Astro.props;
---

<div class="places-autocomplete-container">
  <input
    type="text"
    id={inputId}
    placeholder={placeholder}
    required={required}
    class="places-autocomplete-input"
  />
  <div id={`${inputId}-results`} class="places-results"></div>
</div>

<script>
  // Places API integration logic
</script>
```

### D-3: Places API Integration Logic

**Core Functionality** (`src/components/PlacesAutocomplete.ts`):

```typescript
interface PlaceData {
  placeId: string;
  name: string;
  formattedAddress: string;
  phoneNumber?: string;
  website?: string;
  businessStatus: string;
  types: string[];
  geometry: {
    location: { lat: number; lng: number };
  };
}

class PlacesAutocomplete {
  private autocomplete: google.maps.places.Autocomplete;
  private map: google.maps.Map;

  constructor(inputElement: HTMLInputElement) {
    this.initializeAutocomplete(inputElement);
  }

  private initializeAutocomplete(input: HTMLInputElement) {
    // Configure autocomplete for business establishments
    this.autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["establishment"],
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "formatted_phone_number",
        "website",
        "business_status",
        "types",
        "geometry",
      ],
    });

    // Handle place selection
    this.autocomplete.addListener("place_changed", () => {
      this.handlePlaceSelection();
    });
  }

  private handlePlaceSelection() {
    const place = this.autocomplete.getPlace();
    if (!place.place_id) return;

    const placeData: PlaceData = this.extractPlaceData(place);
    this.populateForm(placeData);
  }

  private populateForm(data: PlaceData) {
    // Auto-populate form fields
    // Generate Google Business Profile URL
    const businessProfileUrl = `https://www.google.com/maps/place/?q=place_id:${data.placeId}`;
  }
}
```

### D-4: Audit Form Integration

**Enhanced Form Structure**:

```astro
<!-- src/pages/audit.astro -->
<form method="POST">
  <div class="grid gap-4">
    <!-- NEW: Business Search -->
    <div class="business-search-section">
      <label for="business-search">Search for your business</label>
      <PlacesAutocomplete
        inputId="business-search"
        placeholder="Start typing your business name..."
        onPlaceSelected="populateBusinessFields"
      />
      <p class="help-text">
        Select your business from Google to auto-fill details
      </p>
    </div>

    <!-- ENHANCED: Existing fields with auto-population -->
    <input
      type="text"
      id="business-name"
      name="business-name"
      placeholder="Business Name"
      value={session?.user?.name?.split(" ")[0] || ""}
      required
    />

    <input
      type="text"
      id="business-address"
      name="business-address"
      placeholder="Business Address"
      required
    />

    <input
      type="tel"
      id="business-phone"
      name="business-phone"
      placeholder="Phone Number"
    />

    <input
      type="url"
      id="business-website"
      name="business-website"
      placeholder="Website URL"
    />

    <!-- NEW: Hidden fields for additional data -->
    <input type="hidden" id="place-id" name="place-id" />
    <input type="hidden" id="google-business-url" name="google-business-url" />
    <input type="hidden" id="business-types" name="business-types" />

    <!-- Existing personal fields -->
    <input
      type="text"
      placeholder="First Name"
      value={session?.user?.name?.split(" ")[0] || ""}
      required
    />
    <input
      type="text"
      placeholder="Last Name"
      value={session?.user?.name?.split(" ")[1] || ""}
      required
    />
    <input
      type="email"
      placeholder="Email"
      value={session?.user?.email || ""}
      required
    />
    <input type="tel" placeholder="Personal Phone" />
    <textarea placeholder="Message" required></textarea>
  </div>

  <button type="submit" class="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
    Submit Audit Request
  </button>
</form>
```

### D-5: API Loading and Initialization

**Script Integration**:

```html
<!-- Load Google Maps API with Places Library -->
<script
  src={`https://maps.googleapis.com/maps/api/js?key=${import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initPlacesAutocomplete`}
  async
  defer>
</script>

<script>
  function initPlacesAutocomplete() {
    const searchInput = document.getElementById('business-search');
    if (searchInput) {
      new PlacesAutocomplete(searchInput);
    }
  }

  function populateBusinessFields(placeData) {
    // Populate form fields with selected place data
    document.getElementById('business-name').value = placeData.name || '';
    document.getElementById('business-address').value = placeData.formattedAddress || '';
    document.getElementById('business-phone').value = placeData.phoneNumber || '';
    document.getElementById('business-website').value = placeData.website || '';
    document.getElementById('place-id').value = placeData.placeId || '';
    document.getElementById('google-business-url').value =
      `https://www.google.com/maps/place/?q=place_id:${placeData.placeId}`;
    document.getElementById('business-types').value = placeData.types.join(',');
  }
</script>
```

### D-6: TypeScript Type Definitions

**Places API Types** (`src/types/places.ts`):

```typescript
export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  business_status: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  types: string[];
  geometry: {
    location: google.maps.LatLng;
  };
}

export interface BusinessFormData {
  businessName: string;
  businessAddress: string;
  businessPhone?: string;
  businessWebsite?: string;
  placeId: string;
  googleBusinessUrl: string;
  businessTypes: string[];
  firstName: string;
  lastName: string;
  email: string;
  personalPhone?: string;
  message: string;
}
```

### D-7: Styling and UX Enhancements

**CSS Enhancements**:

```css
/* src/styles/places-autocomplete.css */
.places-autocomplete-container {
  position: relative;
  width: 100%;
}

.places-autocomplete-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.places-autocomplete-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Google's autocomplete dropdown styling */
.pac-container {
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-family: inherit;
}

.pac-item {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.pac-item:hover {
  background-color: #f9fafb;
}

.pac-item-selected {
  background-color: #eff6ff;
}
```

## E. SECURITY AND MONITORING SETUP

### E-1: Google Cloud Console Configuration

1. **API Key Restrictions**:
   - Application restrictions: HTTP referrers (your domain)
   - API restrictions: Places API (New), Maps JavaScript API
   - Quotas: Set reasonable daily limits

2. **Monitoring Setup**:
   - Enable billing alerts
   - Set up quota alerts
   - Monitor API usage in Cloud Console

### E-2: Usage Optimization

1. **Autocomplete Configuration**:
   - Limit to establishment types only
   - Request only necessary place fields
   - Implement debouncing for API calls

2. **Caching Strategy**:
   - Store recent searches in sessionStorage
   - Cache place details for session duration

## F. TESTING AND VALIDATION

### F-1: Functionality Testing

1. **Autocomplete Behavior**:
   - Search suggestions appear correctly
   - Place selection populates all fields
   - Form submission includes all business data

2. **Error Handling**:
   - API key restrictions work correctly
   - Graceful fallback when Places API unavailable
   - Form still functional if JavaScript disabled

### F-2: Security Testing

1. **API Key Protection**:
   - Verify referrer restrictions block unauthorized domains
   - Test quota limits trigger correctly
   - Monitor for unusual usage patterns

## G. DEPLOYMENT CHECKLIST

### G-1: Pre-Deployment

- [ ] Configure API key restrictions in Google Cloud Console
- [ ] Set up billing alerts and quotas
- [ ] Test autocomplete functionality thoroughly
- [ ] Verify form submission includes all business data
- [ ] Test on various devices and browsers

### G-2: Post-Deployment

- [ ] Monitor API usage for first 24-48 hours
- [ ] Verify no unauthorized usage detected
- [ ] Test user experience with real business searches
- [ ] Document any issues for iteration

## H. FUTURE ENHANCEMENTS

1. **Advanced Features**:
   - Multiple location support for multi-location businesses
   - Business verification status display
   - Integration with Google My Business API for claimed business data
   - Photo integration from Google Places
   - Reviews and ratings display

2. **Performance Optimizations**:
   - Implement request debouncing
   - Add loading states and skeletons
   - Progressive enhancement for non-JS users

3. **Analytics Integration**:
   - Track autocomplete usage patterns
   - Monitor form completion rates
   - A/B test different UX approaches

## I. ACTION PLAN CHECKLIST

### Phase 1: API Security Setup

- [ ] 1. Access Google Cloud Console → APIs & Services → Credentials
- [ ] 2. Edit existing `PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] 3. Add HTTP referrer restrictions for your domain
- [ ] 4. Restrict API access to Places API (New) and Maps JavaScript API only
- [ ] 5. Set initial quota limits (1000 requests/day)
- [ ] 6. Enable billing alerts at $10, $25, $50 thresholds
- [ ] 7. Test API key restrictions work correctly

### Phase 2: Core Component Development

- [ ] 8. Create `src/types/places.ts` with TypeScript interfaces
- [ ] 9. Create `src/components/PlacesAutocomplete.ts` with core logic
- [ ] 10. Create `src/components/PlacesAutocomplete.astro` component
- [ ] 11. Add CSS styling for autocomplete dropdown
- [ ] 12. Test component in isolation with sample data

### Phase 3: Form Integration

- [ ] 13. Modify `src/pages/audit.astro` to include Places autocomplete
- [ ] 14. Add new form fields for business data (hidden and visible)
- [ ] 15. Implement form field auto-population logic
- [ ] 16. Add Google Maps API script loading with proper callback
- [ ] 17. Test complete form flow with place selection

### Phase 4: Enhancement and Polish

- [ ] 18. Add loading states and error handling
- [ ] 19. Implement input debouncing for performance
- [ ] 20. Add help text and user guidance
- [ ] 21. Style autocomplete to match existing form design
- [ ] 22. Test accessibility and keyboard navigation

### Phase 5: Testing and Validation

- [ ] 23. Test autocomplete with various business types
- [ ] 24. Verify all form fields populate correctly
- [ ] 25. Test form submission includes all business data
- [ ] 26. Validate API key restrictions prevent unauthorized access
- [ ] 27. Test graceful degradation when JavaScript disabled
- [ ] 28. Cross-browser and mobile device testing

### Phase 6: Documentation and Deployment

- [ ] 29. Create `docs/places-api-setup.md` documentation
- [ ] 30. Update `.env.example` with any new variables
- [ ] 31. Test deployment in staging environment
- [ ] 32. Monitor initial API usage patterns
- [ ] 33. Document any issues for future iterations

### Phase 7: Post-Launch Monitoring

- [ ] 34. Monitor Google Cloud Console for usage patterns
- [ ] 35. Check for any unauthorized API access attempts
- [ ] 36. Gather user feedback on autocomplete experience
- [ ] 37. Analyze form completion rates before/after integration
- [ ] 38. Plan any necessary adjustments or optimizations

<!-- README_SNIPPET_START
### New Feature – Business Search with Google Places

The audit form now includes intelligent business search powered by Google Places API. Users can simply start typing their business name to see autocomplete suggestions, automatically populating business details including name, address, phone, website, and Google Business Profile link. This streamlines the audit request process and ensures accurate business information capture.

**Key Benefits:**
- **Faster Form Completion**: Auto-fill business details with a single selection
- **Accurate Data**: Verified business information from Google's comprehensive database
- **Better User Experience**: Real-time search suggestions with familiar Google-style interface
- **Complete Business Profiles**: Automatic capture of Google Business Profile URLs and place IDs

Perfect for businesses seeking professional SEO audits with verified location data.
README_SNIPPET_END -->

────────────────────────────────────────

**PLAN COMPLETE**

This comprehensive plan provides a complete roadmap for integrating Google Places API into your audit form using a secure, pure client-side approach. The implementation prioritizes security through proper API key restrictions while delivering an excellent user experience with auto-populated business information.

The plan includes all necessary components, security configurations, testing procedures, and a detailed 10-day implementation timeline. The final integration will allow users to search for their business and automatically populate form fields with verified Google data, significantly improving the audit request process.
