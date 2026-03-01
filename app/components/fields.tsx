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

export default function Fields({ onSubmitLocations, onSetHotelCoords }: FieldsProps) {
  const [form, setForm] = useState({
    tripDuration: 1,
    transport: "walk",
    maxDistance: 20,
    budget: 100,
    cuisine: "italian",
    mealsPerDay: 3,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        onSetHotelCoords({ lat: hotelPlace.lat, lng: hotelPlace.lng });
        onSubmitLocations(result.days.flatMap((day: any) => day.meals));
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  };

  const labelClass =
    "text-xs text-white/40 uppercase tracking-[0.15em] font-semibold";

  const inputClass =
    "w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:ring-1 focus:ring-[#5abcb9]/50 focus:outline-none transition-all";

  const inputStyle = {
    background: "rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "white",
  };

  return (
    <div
      className="flex h-full w-[400px] shrink-0 flex-col rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      style={{
        background: "rgba(255,255,255,0.045)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="mb-5 text-sm font-semibold tracking-[0.12em] text-white/60 uppercase">
        Plan your trip
      </p>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Hotel</label>
          <input
            ref={hotelInputRef}
            type="text"
            placeholder="Search for your hotel…"
            className={inputClass}
            style={inputStyle}
            onChange={() => setHotelPlace(null)}
          />
        </div>

        <div className="my-0.5 h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Duration</label>
            <input
              type="number"
              name="tripDuration"
              value={form.tripDuration}
              onChange={handleChange}
              placeholder="Days"
              min={1}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
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
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Budget / Day</label>
            <input
              type="text"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="USD"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Max Distance</label>
            <input
              type="text"
              name="maxDistance"
              value={form.maxDistance}
              onChange={handleChange}
              placeholder="miles"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Transport</label>
          <div className="relative">
            <select
              name="transport"
              value={form.transport}
              onChange={handleChange}
              className={`${inputClass} appearance-none pr-7`}
              style={inputStyle}
            >
              <option value="walk">Walk</option>
              <option value="car">Car</option>
              <option value="public_transit">Transit</option>
              <option value="bike">Bike</option>
            </select>
            <RiArrowDropDownLine
              size={16}
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-white/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Preferred Cuisine</label>
          <input
            type="text"
            name="cuisine"
            value={form.cuisine}
            onChange={handleChange}
            placeholder="Italian, Thai…"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
          <button
            type="submit"
            className="w-full rounded-lg py-3 text-sm font-semibold tracking-widest text-white uppercase transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #399e5a, #26532b)",
              boxShadow: "0 0 24px rgba(57,158,90,0.4)",
            }}
          >
            Plan Meals
          </button>
        </div>
      </form>
    </div>
  );
}