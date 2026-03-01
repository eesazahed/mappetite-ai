import { NextResponse } from "next/server";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

import type { UserInput, GeocodeResult, Place } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ===== Helper functions =====

async function getHotelCoordinates(address: string) {
  const resp = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
  );

  const data = (await resp.json()) as GeocodeResult;

  if (!data?.results || data.results.length === 0) {
    throw new Error(`No geocoding results for address: ${address}`);
  }

  const location = data.results[0].geometry.location;

  return { lat: location.lat, lng: location.lng };
}

async function getRestaurants(
  lat: number,
  lng: number,
  cuisine: string,
  radius = 2000,
): Promise<Place[]> {
  const resp = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&keyword=${encodeURIComponent(
      cuisine,
    )}&opennow=true&key=${process.env.GOOGLE_MAPS_API_KEY}`,
  );

  type PlacesResult = {
    name: string;
    vicinity: string;
    geometry: { location: { lat: number; lng: number } };
    rating?: number;
    place_id: string;
  };

  type PlacesResponse = { results: PlacesResult[]; status: string };

  const data = (await resp.json()) as PlacesResponse;

  if (!data?.results || !Array.isArray(data.results)) {
    throw new Error("No restaurants found or invalid Places API response");
  }

  return data.results.map((r) => ({
    name: r.name,
    address: r.vicinity,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    rating: r.rating || null,
    place_id: r.place_id,
  }));
}

function parseAIResponse(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { raw: text };
  }
}

async function generateMealPlan(
  input: UserInput,
  hotelCoords: { lat: number; lng: number },
  restaurants: Place[],
) {
  // Read prompt template
  const promptPath = path.join(process.cwd(), "prompts", "mealPlanPrompt.txt");
  let prompt = fs.readFileSync(promptPath, "utf-8");

  // Replace placeholders
  prompt = prompt
    .replace("{{hotelCoords}}", JSON.stringify(hotelCoords))
    .replace("{{transportation}}", input.transportation)
    .replace("{{budgetPerDay}}", input.budgetPerDay.toString())
    .replace("{{mealsPerDay}}", (input.mealsPerDay || 3).toString())
    .replace(
      "{{maxWalkingTimeMinutes}}",
      input.maxWalkingTimeMinutes?.toString() || "no limit",
    )
    .replace(
      "{{dietaryRestrictions}}",
      input.dietaryRestrictions?.join(", ") || "none",
    )
    .replace("{{restaurantsJSON}}", JSON.stringify(restaurants, null, 2));

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return parseAIResponse(String(response.text));
}

// ===== API Route =====

export async function GET() {
  try {
    const testInput: UserInput = {
      city: "Boston",
      hotel: "Omni Parker House, 185 State St, Boston, MA",
      transportation: "walk",
      cuisines: ["Greek"],
      budgetPerDay: 50,
      mealsPerDay: 3,
      maxWalkingTimeMinutes: 15,
      dietaryRestrictions: [],
    };

    const hotelCoords = await getHotelCoordinates(testInput.hotel);

    const restaurants = await getRestaurants(
      hotelCoords.lat,
      hotelCoords.lng,
      testInput.cuisines[0],
    );

    const plan = await generateMealPlan(testInput, hotelCoords, restaurants);

    return NextResponse.json({ hotelCoords, restaurants, plan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
