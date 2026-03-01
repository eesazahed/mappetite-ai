"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Fields() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", form);
  };

  const labelClass = "text-xs text-gray-500 uppercase tracking-wider";
  const inputClass =
    "w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all";

  return (
    <div className="h-fit w-[48vw] rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass} style={{ fontWeight: 600 }}>
            City
          </label>
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
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Hotel
          </label>
          <input
            type="text"
            name="hotel"
            value={form.hotel}
            onChange={handleChange}
            placeholder="Hotel name or address"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Trip Duration
          </label>
          <input
            type="number"
            name="tripDuration"
            value={form.tripDuration}
            onChange={handleChange}
            placeholder="Number of days"
            min={1}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Mode of Transport
          </label>
          <div className="relative">
            <select
              name="transport"
              value={form.transport}
              onChange={handleChange}
              className={`${inputClass} appearance-none pr-10`}
              style={{ color: form.transport ? undefined : "#c4c4c4" }}
            >
              <option value="" disabled hidden>
                Walk, car, public transit
              </option>
              <option value="walk">Walk</option>
              <option value="car">Car</option>
              <option value="public_transit">Public transit</option>
              <option value="bike">Bike</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Maximum Travel Distance
          </label>
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
          <label className={labelClass} style={{ fontWeight: 600 }}>
            Budget per Day
          </label>
          <input
            type="text"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            placeholder="Amount and currency"
            className={inputClass}
          />
        </div>

                <div className="flex flex-col gap-1">
                    <label className={labelClass} style={{ fontWeight: 600 }}>Preferred Cuisine</label>
                    <input type="text" name="cuisine" value={form.cuisine} onChange={handleChange} placeholder="Italian, Thai, etc." className={inputClass} />
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, includeFastFood: !prev.includeFastFood }))}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${form.includeFastFood ? "bg-brand-500 border-brand-500" : "bg-white border-gray-300 hover:border-brand-300"
                            }`}
                    >
                        {form.includeFastFood && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                    <span className="text-sm text-gray-600">Include fast food</span>
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelClass} style={{ fontWeight: 600 }}>Meals per Day</label>
                    <input type="number" name="mealsPerDay" value={form.mealsPerDay} onChange={handleChange} placeholder="1 to 5" min={1} max={5} className={inputClass} />
                </div>
                <button
                    type="submit"
                    className="mt-1 w-full py-2.5 rounded-xl bg-brand-700 text-white text-sm tracking-wide shadow-sm hover:bg-brand-900 active:scale-[0.98] transition-all"
                    style={{ fontWeight: 600 }}
                >
                    Plan meals
                </button>
            </form>
        </div>
    );
}
