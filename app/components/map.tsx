"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map as GMap, Marker, useMap } from "@vis.gl/react-google-maps";

type Location = {
  lat: number;
  lng: number;
  name: string;
  cuisine?: string;
  openHours?: string;
  googleMapsUrl?: string;
  day?: number;
};

type MapProps = {
  locations: Location[];
  hotelCoords: { lat: number; lng: number } | null;
};

function PanTo({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.panTo(center);
  }, [center, map]);
  return null;
}

export default function MapComponent({ locations, hotelCoords }: MapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [center, setCenter] = useState({ lat: 42.36, lng: -71.09 });

  useEffect(() => {
    fetch("/api/maps-key")
      .then((res) => res.json())
      .then((data) => setApiKey(data.apiKey));
  }, []);

  useEffect(() => {
    if (hotelCoords) setCenter(hotelCoords);
    else if (locations.length)
      setCenter({ lat: locations[0].lat, lng: locations[0].lng });
  }, [hotelCoords, locations]);

  return (
    <div className="h-0 w-full rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all md:mx-0 md:flex md:h-[48vh] md:w-[48vw] md:opacity-100">
      {apiKey && (
        <APIProvider apiKey={apiKey}>
          <GMap
            style={{ width: "100%", height: "100%" }}
            center={center}
            defaultZoom={14}
            gestureHandling="greedy"
          >
            <PanTo center={center} />
            {locations.map((loc, idx) => (
              <Marker
                key={idx}
                position={{ lat: loc.lat, lng: loc.lng }}
                title={loc.name}
              />
            ))}
          </GMap>
        </APIProvider>
      )}
    </div>
  );
}