import { NextResponse } from "next/server";

const GMAPS_API_KEY = process.env.GMAPS_API_KEY!;

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
  const [minLevel, maxLevel] = priceLevelFromBudget(maxPerMeal);

  return restaurants.filter(
    (r) => r.price_level != null && r.price_level <= maxLevel,
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
      return NextResponse.json({
        error: "Not enough restaurants within budget and distance",
      });
    }

    const schedule = buildSchedule(budgetFiltered, days, mealsPerDay);

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
