import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GMAPS_API_KEY!;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function searchRestaurants(
  lat: number,
  lng: number,
  keyword: string,
  radiusMeters: number,
) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=restaurant&keyword=${encodeURIComponent(
      keyword,
    )}&key=${GMAPS_API_KEY}`,
  );

  const data = await res.json();

  console.log(data.results);

  return (data.results || []).map((r: any) => ({
    place_id: r.place_id,
    name: r.name,
    address: r.vicinity,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    rating: r.rating ?? null,
    price_level: r.price_level ?? null,
  }));
}

function dedupeRestaurants(restaurants: any[]) {
  return Array.from(new Map(restaurants.map((r) => [r.place_id, r])).values());
}

function priceLevelFromBudget(maxPerMeal: number) {
  if (maxPerMeal <= 10) return [0, 1];
  if (maxPerMeal <= 30) return [0, 2];
  if (maxPerMeal <= 60) return [0, 3];
  return [0, 4];
}

function filterByBudget(
  restaurants: any[],
  budgetPerDay: number,
  mealsPerDay: number,
) {
  const maxPerMeal = budgetPerDay / mealsPerDay;
  const [, maxLevel] = priceLevelFromBudget(maxPerMeal);

  // Include restaurants with no price_level (data missing) — don't penalise for incomplete data
  return restaurants.filter(
    (r) => r.price_level == null || r.price_level <= maxLevel,
  );
}

function buildSchedule(restaurants: any[], days: number, mealsPerDay: number) {
  const shuffled = [...restaurants].sort(() => 0.5 - Math.random());
  let index = 0;

  const schedule: any[] = [];

  for (let d = 1; d <= days; d++) {
    const meals = [];
    for (let m = 0; m < mealsPerDay; m++) {
      if (index >= shuffled.length) break;
      meals.push({
        type: ["breakfast", "lunch", "dinner"][m] ?? `meal_${m + 1}`,
        ...shuffled[index],
      });
      index++;
    }
    schedule.push({ day: d, meals });
  }

  return schedule;
}

async function buildScheduleWithGemini(
  restaurants: any[],
  days: number,
  mealsPerDay: number,
  hotel: { name: string; lat: number; lng: number },
  attractions: { lat: number; lng: number; name: string }[],
): Promise<any[]> {
  // Distribute attractions across days evenly, giving each an id for Gemini to reference
  const attractionsPerDay: { id: string; name: string; lat: number; lng: number }[][] =
    Array.from({ length: days }, () => []);
  attractions.forEach((a, i) => attractionsPerDay[i % days].push({ id: `attr_${i}`, ...a }));

  const daysPayload = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    attractions: attractionsPerDay[i],
    mealsNeeded: mealsPerDay,
  }));

  const restaurantList = restaurants.map((r) => ({
    place_id: r.place_id,
    name: r.name,
    lat: r.lat,
    lng: r.lng,
    rating: r.rating,
    price_level: r.price_level,
  }));

  const prompt = `You are a travel itinerary optimizer. Plan optimal daily itineraries.

Hotel: ${JSON.stringify({ name: hotel.name, lat: hotel.lat, lng: hotel.lng })}
Days: ${JSON.stringify(daysPayload)}
Restaurants (pick exactly mealsNeeded per day, each restaurant used at most once across all days): ${JSON.stringify(restaurantList)}

For each day:
1. Select restaurants geographically close to that day's attractions (or hotel if no attractions)
2. Order ALL stops (selected restaurants + that day's attractions) to minimize total walking distance starting and ending at the hotel

Return ONLY valid JSON:
{ "days": [{ "day": 1, "orderedStops": [{ "id": "place_id_or_attr_id", "type": "breakfast|lunch|dinner|attraction" }] }] }

Rules:
- id is either a restaurant place_id or an attraction id (e.g. "attr_0")
- type is breakfast, lunch, or dinner for meals; attraction for sights
- Each restaurant appears exactly once across all days
- All attraction ids must appear exactly once
- Stops within each day are ordered for minimal walking from hotel and back to hotel`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = response.text ?? "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned);

  const restaurantMap = new Map(restaurants.map((r) => [r.place_id, r]));
  const attractionMap = new Map(attractionsPerDay.flat().map((a) => [a.id, a]));

  return parsed.days.map((d: any) => {
    const meals: any[] = [];
    const orderedWaypoints: { lat: number; lng: number; name: string; stopType: "meal" | "attraction" }[] = [];

    for (const stop of d.orderedStops) {
      if (stop.type === "attraction") {
        const attr = attractionMap.get(stop.id);
        if (attr) orderedWaypoints.push({ lat: attr.lat, lng: attr.lng, name: attr.name, stopType: "attraction" });
      } else {
        const r = restaurantMap.get(stop.id);
        if (r) {
          meals.push({ type: stop.type, ...r });
          orderedWaypoints.push({ lat: r.lat, lng: r.lng, name: r.name, stopType: "meal" });
        }
      }
    }

    return { day: d.day, meals, orderedWaypoints };
  });
}

function buildScheduleFallback(
  restaurants: any[],
  days: number,
  mealsPerDay: number,
  attractions: { lat: number; lng: number; name: string }[],
): any[] {
  const schedule = buildSchedule(restaurants, days, mealsPerDay);
  const attractionsPerDay: { lat: number; lng: number; name: string }[][] =
    Array.from({ length: days }, () => []);
  attractions.forEach((a, i) => attractionsPerDay[i % days].push(a));

  return schedule.map((day, i) => ({
    ...day,
    orderedWaypoints: [
      ...day.meals.map((m: any) => ({ lat: m.lat, lng: m.lng, name: m.name, stopType: "meal" as const })),
      ...attractionsPerDay[i].map((a) => ({ lat: a.lat, lng: a.lng, name: a.name, stopType: "attraction" as const })),
    ],
  }));
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      hotelName,
      hotelAddress,
      hotelLat,
      hotelLng,
      days,
      mealsPerDay,
      likes,
      budgetPerDay,
      maxDistanceKm,
      attractions = [],
    } = data;

    const radiusMeters = maxDistanceKm * 1000;

    let allRestaurants: any[] = [];

    for (const cuisine of likes) {
      const results = await searchRestaurants(
        hotelLat,
        hotelLng,
        cuisine,
        radiusMeters,
      );
      allRestaurants.push(...results);
    }

    const uniqueRestaurants = dedupeRestaurants(allRestaurants);
    const budgetFiltered = filterByBudget(
      uniqueRestaurants,
      budgetPerDay,
      mealsPerDay,
    );

    if (budgetFiltered.length < days * mealsPerDay) {
      return NextResponse.json(
        { error: "Not enough restaurants found within your budget and distance. Try increasing the distance or budget." },
        { status: 422 },
      );
    }

    let schedule: any[];
    try {
      schedule = await buildScheduleWithGemini(
        budgetFiltered,
        days,
        mealsPerDay,
        { name: hotelName, lat: hotelLat, lng: hotelLng },
        attractions,
      );
      console.log("Gemini itinerary built successfully");
    } catch (geminiError) {
      console.warn("Gemini scheduling failed, falling back to random:", geminiError);
      schedule = buildScheduleFallback(budgetFiltered, days, mealsPerDay, attractions);
    }

    return NextResponse.json({
      message: "Meal plan generated successfully",
      hotel: {
        name: hotelName,
        address: hotelAddress,
        lat: hotelLat,
        lng: hotelLng,
      },
      days: schedule,
      total_days: days,
      meals_per_day: mealsPerDay,
      restaurants_considered: uniqueRestaurants.length,
      restaurants_within_budget: budgetFiltered.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
