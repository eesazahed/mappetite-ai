"use client";

import { useState, useRef, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

type AttractionPlace = { lat: number; lng: number; name: string; address: string };

type DaySchedule = {
  day: number;
  meals: any[];
  orderedWaypoints: { lat: number; lng: number; name: string; stopType: "meal" | "attraction" }[];
};

type FieldsProps = {
  onSubmitLocations: (locations: any[]) => void;
  onSetHotelCoords: (coords: { lat: number; lng: number; name: string } | null) => void;
  onSetAttractions: (attractions: AttractionPlace[]) => void;
  onSetDaySchedules: (schedules: DaySchedule[]) => void;
  onError: (message: string) => void;
  onLoadingChange: (loading: boolean) => void;
};

type HotelPlace = {
  lat: number;
  lng: number;
  name: string;
  address: string;
};

function AttractionInput({
  placesLib,
  onSelect,
  onRemove,
}: {
  placesLib: google.maps.PlacesLibrary | null;
  onSelect: (p: AttractionPlace | null) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const inputClass =
    "w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:ring-1 focus:ring-[#5abcb9]/50 focus:outline-none transition-all";
  const inputStyle = {
    background: "rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "white",
  };

  useEffect(() => {
    if (!placesLib || !ref.current) return;
    const ac = new placesLib.Autocomplete(ref.current, {
      fields: ["name", "geometry", "formatted_address"],
    });
    const l = ac.addListener("place_changed", () => {
      const p = ac.getPlace();
      if (p?.geometry?.location)
        onSelect({
          lat: p.geometry.location.lat(),
          lng: p.geometry.location.lng(),
          name: p.name || "",
          address: p.formatted_address || "",
        });
    });
    return () => google.maps.event.removeListener(l);
  }, [placesLib]);

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <input
        ref={ref}
        type="text"
        placeholder="Search attraction…"
        className={inputClass}
        style={inputStyle}
        onChange={() => onSelect(null)}
      />
      <button
        type="button"
        onClick={onRemove}
        style={{ color: "rgba(255,255,255,0.35)", fontSize: "18px", lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}

export default function Fields({
  onSubmitLocations,
  onSetHotelCoords,
  onSetAttractions,
  onSetDaySchedules,
  onError,
  onLoadingChange,
}: FieldsProps) {
  const [form, setForm] = useState({
    maxDistance: 20,
    budget: 100,
    cuisine: "italian",
    mealsPerDay: 3,
  });

  const [hotelPlace, setHotelPlace] = useState<HotelPlace | null>(null);
  const hotelInputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");

  const [slots, setSlots] = useState<number[]>([0]);
  const [places, setPlaces] = useState<Record<number, AttractionPlace | null>>({ 0: null });
  const nextId = useRef(1);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hotelPlace) {
      onError("Form Incomplete: Please select a hotel from the suggestions");
      return;
    }

    const attractionList = slots.map((id) => places[id]).filter(Boolean) as AttractionPlace[];

    onLoadingChange(true);
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelName: hotelPlace.name,
          hotelAddress: hotelPlace.address,
          hotelLat: hotelPlace.lat,
          hotelLng: hotelPlace.lng,
          days: 1,
          mealsPerDay: Number(form.mealsPerDay),
          likes: form.cuisine.split(",").map((c) => c.trim()),
          budgetPerDay: Number(form.budget),
          maxDistanceKm: Number(form.maxDistance),
          attractions: attractionList,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        onSetHotelCoords({ lat: hotelPlace.lat, lng: hotelPlace.lng, name: hotelPlace.name });
        onSetAttractions(attractionList);
        onSetDaySchedules(result.days);
        onSubmitLocations(result.days.flatMap((day: any) => day.meals));
      } else {
        onError(result.error || "Something went wrong");
      }
    } catch {
      onError("Network Error: Could not reach the server");
    } finally {
      onLoadingChange(false);
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Tourist Attractions</label>
            <button
              type="button"
              onClick={() => {
                const id = nextId.current++;
                setSlots((s) => [...s, id]);
                setPlaces((p) => ({ ...p, [id]: null }));
              }}
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "5px",
                padding: "2px 8px",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              + Add
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {slots.map((id) => (
              <AttractionInput
                key={id}
                placesLib={placesLib}
                onSelect={(p) => setPlaces((prev) => ({ ...prev, [id]: p }))}
                onRemove={() => {
                  setSlots((s) => s.filter((sid) => sid !== id));
                  setPlaces((p) => {
                    const next = { ...p };
                    delete next[id];
                    return next;
                  });
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="my-0.5 h-px w-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

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

        <div
          className="my-0.5 h-px w-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Meals</label>
            <input
              type="number"
              name="mealsPerDay"
              value={form.mealsPerDay}
              onChange={handleChange}
              placeholder="1-5"
              min={1}
              max={5}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Budget</label>
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
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Max Distance</label>
          <input
            type="text"
            name="maxDistance"
            value={form.maxDistance}
            onChange={handleChange}
            placeholder="km from hotel"
            className={inputClass}
            style={inputStyle}
          />
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
          <div
            className="h-px w-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
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
