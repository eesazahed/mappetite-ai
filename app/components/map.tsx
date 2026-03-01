"use client";

import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

type Location = { lat: number; lng: number; name: string };

type MapProps = {
  locations: Location[];
  hotelCoords: { lat: number; lng: number } | null;
};

function PanTo({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [center, map]);

  return null;
}

export default function MapComponent({ locations, hotelCoords }: MapProps) {
  const [mapVisible, showMap] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [center, setCenter] = useState({ lat: 42.36, lng: -71.09 });

  useEffect(() => {
    showMap(true);
    fetch("/api/maps-key")
      .then((res) => res.json())
      .then((data) => setApiKey(data.apiKey));
  }, []);

  // Update center: prefer hotelCoords, fallback to first location
  useEffect(() => {
    if (hotelCoords) {
      setCenter(hotelCoords);
    } else if (locations.length > 0) {
      setCenter({ lat: locations[0].lat, lng: locations[0].lng });
    }
  }, [hotelCoords, locations]);

  return (
    <div
      style={{
        width: "40vw",
        height: "600px",
        opacity: mapVisible ? 1 : 0,
        transition: "opacity 1s ease",
        pointerEvents: mapVisible ? "auto" : "none",
        marginLeft: "40px",
        filter: "drop-shadow(0px 0px 0px #000)",
      }}
      className="h-fit w-[48vw] rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
    >
      {apiKey && (
        <APIProvider apiKey={apiKey}>
          <Map
            style={{ width: "100%", height: "100%" }}
            center={center} // controlled center
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
          </Map>
        </APIProvider>
      )}
    </div>
  );
}
