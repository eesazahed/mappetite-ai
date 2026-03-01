"use client";

import { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

type FieldsProps = {
  onSubmitLocations: (locations: any[]) => void;
  onSetHotelCoords: (coords: { lat: number; lng: number } | null) => void;
};

export default function Fields({
  onSubmitLocations,
  onSetHotelCoords,
}: FieldsProps) {
  const [form, setForm] = useState({
    city: "",
    hotel: "",
    tripDuration: "",
    transport: "",
    maxDistance: "",
    budget: "",
    cuisine: "",
    includeFastFood: false,
    mealsPerDay: "",
  });

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

    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city,
          hotelName: form.hotel,
          days: Number(form.tripDuration),
          mealsPerDay: Number(form.mealsPerDay),
          likes: form.cuisine.split(",").map((c) => c.trim()),
          budgetPerDay: Number(form.budget),
          maxDistanceKm: Number(form.maxDistance),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        onSubmitLocations(result.days.flatMap((day: any) => day.meals));
      } else {
        alert(result.error);
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
          <label className={labelClass}>City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Enter city"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Hotel</label>
          <input
            type="text"
            name="hotel"
            value={form.hotel}
            onChange={handleChange}
            placeholder="Hotel name-- include address!"
            className={inputClass}
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