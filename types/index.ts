export type UserInput = {
  city: string;
  hotel: string;
  transportation: "walk" | "transit" | "car" | "bike";
  cuisines: string[];
  budgetPerDay: number;
  mealsPerDay?: number;
  maxWalkingTimeMinutes?: number;
  dietaryRestrictions?: string[];
};

export type GeocodeResult = {
  results: {
    geometry: { location: { lat: number; lng: number } };
    formatted_address: string;
    place_id: string;
  }[];
  status: string;
};

export type Place = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  place_id: string;
};
