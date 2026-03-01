"use client";

import { useState, useRef, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { RiArrowDropDownLine } from "react-icons/ri";

type FieldsProps = {
  onSubmitLocations: (locations: any[]) => void;
  onSetHotelCoords: (coords: { lat: number; lng: number } | null) => void;
};

type HotelPlace = {
  lat: number;
  lng: number;
  name: string;
  address: string;
};

export default function Fields({
  onSubmitLocations,
  onSetHotelCoords,
}: FieldsProps) {
  const [form, setForm] = useState({
    tripDuration: "",
    transport: "",
    maxDistance: "",
    budget: "",
    cuisine: "",
    includeFastFood: false,
    mealsPerDay: "",
  });

  const [hotelPlace, setHotelPlace] = useState<HotelPlace | null>(null);
  const hotelInputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLib || !hotelInputRef.current) return;

    const autocomplete = new placesLib.Autocomplete(hotelInputRef.current, {
      types: ["lodging"],
      fields: ["name", "geometry", "formatted_address"],
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.geometry?.location) {
        setHotelPlace({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.name || "",
          address: place.formatted_address || "",
        });
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [placesLib]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
    } else {
      setForm((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotelPlace) {
      alert("Please select a hotel from the autocomplete suggestions.");
      return;
    }

    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelName: hotelPlace.name,
          hotelAddress: hotelPlace.address,
          hotelLat: hotelPlace.lat,
          hotelLng: hotelPlace.lng,
          days: Number(form.tripDuration),
          mealsPerDay: Number(form.mealsPerDay),
          likes: form.cuisine.split(",").map((c) => c.trim()),
          budgetPerDay: Number(form.budget),
          maxDistanceKm: Number(form.maxDistance),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        console.log("Success:", result);
        onSetHotelCoords({
          lat: hotelPlace.lat,
          lng: hotelPlace.lng,
        });
        const allMeals = result.days.flatMap((day: any) => day.meals);
        onSubmitLocations(allMeals);
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  };

  const labelClass =
    "text-[10px] text-gray-500 uppercase tracking-wider font-semibold";

  const inputClass =
    "w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all";

  return (
    <div className="h-fit w-full max-w-md rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Hotel
          </label>
          <input
            ref={hotelInputRef}
            type="text"
            placeholder="Search for your hotel..."
            className={inputClass}
            onChange={() => setHotelPlace(null)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Trip Duration</label>
          <input
            type="number"
            name="tripDuration"
            value={form.tripDuration}
            onChange={handleChange}
            placeholder="Days"
            min={1}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Mode of Transport</label>
          <div className="relative">
            <select
              name="transport"
              value={form.transport}
              onChange={handleChange}
              className={`${inputClass} appearance-none pr-8`}
              style={{ color: form.transport ? undefined : "#c4c4c4" }}
            >
              <option value="" disabled hidden>
                Walk, car, transit
              </option>
              <option value="walk">Walk</option>
              <option value="car">Car</option>
              <option value="public_transit">Transit</option>
              <option value="bike">Bike</option>
            </select>
            <RiArrowDropDownLine
              size={16}
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Max Distance</label>
          <input
            type="text"
            name="maxDistance"
            value={form.maxDistance}
            onChange={handleChange}
            placeholder="Miles or km"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Budget / Day</label>
          <input
            type="text"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            placeholder="Amount"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Preferred Cuisine</label>
          <input
            type="text"
            name="cuisine"
            value={form.cuisine}
            onChange={handleChange}
            placeholder="Italian, Thai..."
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                includeFastFood: !prev.includeFastFood,
              }))
            }
            className={`flex h-4 w-4 items-center justify-center rounded border transition ${
              form.includeFastFood
                ? "bg-brand-500 border-brand-500"
                : "border-gray-300 bg-white"
            }`}
          >
            {form.includeFastFood && (
              <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span className="text-xs text-gray-600">
            Include fast food
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Meals / Day</label>
          <input
            type="number"
            name="mealsPerDay"
            value={form.mealsPerDay}
            onChange={handleChange}
            placeholder="1–5"
            min={1}
            max={5}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-brand-700 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition-all hover:bg-brand-900 active:scale-[0.98]"
        >
          Plan Meals
        </button>
      </form>
    </div>
  );
}