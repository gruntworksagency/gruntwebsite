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

export interface PlaceData {
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

export interface PlacesAutocompleteCallbacks {
  onPlaceSelected?: (placeData: PlaceData) => void;
  onClear?: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

// Global type augmentation for Google Maps
declare global {
  interface Window {
    initPlacesAutocomplete: () => void;
    populateBusinessFields: (placeData: PlaceData) => void;
    clearBusinessFields: () => void;
  }
}
