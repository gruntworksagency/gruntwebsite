import type { PlaceData, GooglePlace } from "../types/places";

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

  private initializeAutocomplete(input: HTMLInputElement): void {
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

  private extractPlaceData(place: GooglePlace): PlaceData {
    return {
      placeId: place.place_id,
      name: place.name || "",
      formattedAddress: place.formatted_address || "",
      phoneNumber: place.formatted_phone_number || "",
      website: place.website || "",
      businessStatus: place.business_status || "OPERATIONAL",
      types: place.types || [],
      geometry: {
        location: {
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
        },
      },
    };
  }

  private populateForm(data: PlaceData): void {
    // Auto-populate form fields
    const businessNameField = document.getElementById(
      "business-name",
    ) as HTMLInputElement;
    const businessAddressField = document.getElementById(
      "business-address",
    ) as HTMLInputElement;
    const businessPhoneField = document.getElementById(
      "business-phone",
    ) as HTMLInputElement;
    const businessWebsiteField = document.getElementById(
      "business-website",
    ) as HTMLInputElement;
    const placeIdField = document.getElementById(
      "place-id",
    ) as HTMLInputElement;
    const googleBusinessUrlField = document.getElementById(
      "google-business-url",
    ) as HTMLInputElement;
    const businessTypesField = document.getElementById(
      "business-types",
    ) as HTMLInputElement;

    if (businessNameField) businessNameField.value = data.name;
    if (businessAddressField)
      businessAddressField.value = data.formattedAddress;
    if (businessPhoneField) businessPhoneField.value = data.phoneNumber || "";
    if (businessWebsiteField) businessWebsiteField.value = data.website || "";
    if (placeIdField) placeIdField.value = data.placeId;
    if (googleBusinessUrlField) {
      googleBusinessUrlField.value = `https://www.google.com/maps/place/?q=place_id:${data.placeId}`;
    }
    if (businessTypesField) businessTypesField.value = data.types.join(",");

    // Add visual feedback
    this.addVisualFeedback();
  }

  private addVisualFeedback(): void {
    // Add a brief visual indication that fields were populated
    const populatedFields = [
      "business-name",
      "business-address",
      "business-phone",
      "business-website",
    ];

    populatedFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId) as HTMLInputElement;
      if (field && field.value) {
        field.classList.add("field-populated");
        setTimeout(() => {
          field.classList.remove("field-populated");
        }, 2000);
      }
    });
  }

  // Public method to manually trigger place selection (for testing)
  public triggerPlaceSelection(): void {
    this.handlePlaceSelection();
  }

  // Public method to get current place data
  public getCurrentPlace(): PlaceData | null {
    const place = this.autocomplete.getPlace();
    if (!place.place_id) return null;
    return this.extractPlaceData(place as GooglePlace);
  }

  private addLoadingStates(): void {
    // Add loading indicator support
    this.inputElement.addEventListener("input", () => {
      this.setLoadingState(true);

      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Set debounce timer
      this.debounceTimer = setTimeout(() => {
        this.setLoadingState(false);
      }, 500);
    });
  }

  private setLoadingState(loading: boolean): void {
    this.isLoading = loading;
    const container = this.inputElement.parentElement;

    if (loading) {
      this.inputElement.classList.add("places-loading");
      if (container) {
        container.setAttribute("data-loading", "true");
      }
    } else {
      this.inputElement.classList.remove("places-loading");
      if (container) {
        container.removeAttribute("data-loading");
      }
    }
  }

  private handleError(error: string): void {
    console.error("Places API Error:", error);

    // Show user-friendly error message
    const container = this.inputElement.parentElement;
    if (container) {
      const existingError = container.querySelector(".places-error");
      if (existingError) {
        existingError.remove();
      }

      const errorElement = document.createElement("div");
      errorElement.className = "places-error";
      errorElement.textContent =
        "Unable to search businesses. Please try again.";
      container.appendChild(errorElement);

      // Remove error message after 5 seconds
      setTimeout(() => {
        errorElement.remove();
      }, 5000);
    }
  }
}
