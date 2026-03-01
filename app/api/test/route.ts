import { NextResponse } from "next/server";

const GMAPS_API_KEY = process.env.GMAPS_API_KEY!;

/* =========================
   HARDCODED USER INPUT
========================= */

const CITY = "Paris, France";
const HOTEL_NAME = "Hotel Georgette, Paris";
const DAYS = 2;
const MEALS_PER_DAY = 2;
const LIKES = ["italian", "french", "american"];
const BUDGET_PER_DAY = 50; // USD
const MAX_DISTANCE_KM = 10;

/* =========================
   HELPERS
========================= */

// 1️⃣ Geocode hotel
async function geocode(address: string) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${GMAPS_API_KEY}`,
  );

  const data = await res.json();
  const location = data.results?.[0]?.geometry?.location;

  if (!location) throw new Error("Geocoding failed");

  return {
    lat: location.lat,
    lng: location.lng,
    formatted_address: data.results[0].formatted_address,
  };
}

// 2️⃣ Nearby search by cuisine
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

// 3️⃣ Remove duplicate restaurants
function dedupeRestaurants(restaurants: any[]) {
  return Array.from(new Map(restaurants.map((r) => [r.place_id, r])).values());
}

// 4️⃣ Filter by budget
function filterByBudget(restaurants: any[]) {
  const maxPerMeal = BUDGET_PER_DAY / MEALS_PER_DAY;

  // price_level mapping estimate
  // 0-1 cheap, 2 moderate, 3 expensive
  return restaurants.filter((r) => {
    if (r.price_level == null) return false;
    if (maxPerMeal <= 20) return r.price_level <= 2;
    if (maxPerMeal <= 40) return r.price_level <= 3;
    return true;
  });
}

// 5️⃣ Build meal schedule
function buildSchedule(restaurants: any[]) {
  const shuffled = [...restaurants].sort(() => 0.5 - Math.random());
  let index = 0;

  const days = [];

  for (let d = 1; d <= DAYS; d++) {
    const meals = [];

    for (let m = 0; m < MEALS_PER_DAY; m++) {
      if (index >= shuffled.length) break;

      meals.push({
        type: ["breakfast", "lunch", "dinner"][m] ?? `meal_${m + 1}`,
        ...shuffled[index],
      });

      index++;
    }

    days.push({
      day: d,
      meals,
    });
  }

  return days;
}

/* =========================
   MAIN ROUTE
========================= */

export async function GET() {
  try {
    // 1️⃣ Geocode hotel
    const hotel = await geocode(HOTEL_NAME);
    const radiusMeters = MAX_DISTANCE_KM * 1000;

    // 2️⃣ Fetch restaurants by cuisine
    let allRestaurants: any[] = [];

    for (const cuisine of LIKES) {
      const results = await searchRestaurants(
        hotel.lat,
        hotel.lng,
        cuisine,
        radiusMeters,
      );
      allRestaurants.push(...results);
    }

    // 3️⃣ Deduplicate
    const uniqueRestaurants = dedupeRestaurants(allRestaurants);

    // 4️⃣ Budget filter
    const budgetFiltered = filterByBudget(uniqueRestaurants);

    if (budgetFiltered.length < DAYS * MEALS_PER_DAY) {
      return NextResponse.json({
        error: "Not enough restaurants within budget and distance",
      });
    }

    // 5️⃣ Build plan
    const schedule = buildSchedule(budgetFiltered);

    return NextResponse.json({
      city: CITY,
      hotel: {
        name: HOTEL_NAME,
        address: hotel.formatted_address,
        lat: hotel.lat,
        lng: hotel.lng,
      },
      days: schedule,
      total_days: DAYS,
      meals_per_day: MEALS_PER_DAY,
      restaurants_considered: uniqueRestaurants.length,
      restaurants_within_budget: budgetFiltered.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
