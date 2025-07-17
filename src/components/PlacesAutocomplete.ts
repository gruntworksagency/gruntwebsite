import type { PlaceData, GooglePlace } from "../types/places";

export class PlacesAutocomplete {
  private autocomplete: google.maps.places.Autocomplete;
  private inputElement: HTMLInputElement;

  constructor(inputElement: HTMLInputElement) {
    this.inputElement = inputElement;
    this.initializeAutocomplete(inputElement);
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

  private handlePlaceSelection(): void {
    const place = this.autocomplete.getPlace();
    if (!place.place_id) {
      console.warn("No place selected or place_id missing");
      return;
    }

    const placeData: PlaceData = this.extractPlaceData(place as GooglePlace);
    this.populateForm(placeData);

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
}
