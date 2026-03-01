"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

const apiKey = process.env.NEXT_PUBLIC_GMAPS_API_KEY!;

type ExMapProps = {
  locations: { lat: number; lng: number; name: string }[];
};

export default function ExMap({ locations }: ExMapProps) {
  const Lat = 42.36;
  const Lng = -71.09;

  const [mapVisible, showMap] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/maps-key")
      .then((res) => res.json())
      .then((data) => setApiKey(data.apiKey));
  }, []);

  return (
    <div style={{ width: "40vw", 
    height: "600px", 
    opacity: mapVisible ? 1 : 0, 
    transition: "opacity 1s ease", 
    pointerEvents: mapVisible ? "auto" : "none", 
    marginLeft: "40px", 
    filter: "drop-shadow(0px 0px 0px #000)" }
  } 
    className = "h-fit w-[48vw] rounded-2xl border border-gray-100 bg-white p-7 shadow-sm" >
      {apiKey && (
        <APIProvider apiKey={apiKey} onLoad={() => showMap(true)}>
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={{ lat: 42.36, lng: -71.09 }}
            defaultZoom={14}
            gestureHandling="greedy"
          >
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
