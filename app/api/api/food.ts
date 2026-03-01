import { NextResponse } from "next/server";

const GMAPS_API_KEY = process.env.GMAPS_API_KEY!;

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

function filterByBudget(
  restaurants: any[],
  budgetPerDay: number,
  mealsPerDay: number,
) {
  const maxPerMeal = budgetPerDay / mealsPerDay;

  return restaurants.filter((r) => {
    if (r.price_level == null) return false;
    if (maxPerMeal <= 20) return r.price_level <= 2;
    if (maxPerMeal <= 40) return r.price_level <= 3;
    return true;
  });
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

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      city,
      hotelName,
      days,
      mealsPerDay,
      likes,
      budgetPerDay,
      maxDistanceKm,
    } = data;

    const hotel = await geocode(hotelName);
    const radiusMeters = maxDistanceKm * 1000;

    let allRestaurants: any[] = [];

    for (const cuisine of likes) {
      const results = await searchRestaurants(
        hotel.lat,
        hotel.lng,
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
      return NextResponse.json({
        error: "Not enough restaurants within budget and distance",
      });
    }

    const schedule = buildSchedule(budgetFiltered, days, mealsPerDay);

    return NextResponse.json({
      message: "Meal plan generated successfully",
      city,
      hotel: {
        name: hotelName,
        address: hotel.formatted_address,
        lat: hotel.lat,
        lng: hotel.lng,
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
