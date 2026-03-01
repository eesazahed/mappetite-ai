"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

const apiKey = process.env.NEXT_PUBLIC_GMAPS_API_KEY!;

export default function ExMap() {
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
    <div 
        style={{
          width: "40vw",
          height: "600px",
          opacity: mapVisible ? 1 : 0,
          transition: "opacity 1s ease",
          pointerEvents: mapVisible ? "auto" : "none",
          marginLeft: "40px",
          filter: "none !important",
        }}
        className = "h-fit w-[48vw] rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
      >
        {apiKey && (
          <APIProvider
            apiKey={apiKey}
            onLoad={() => 
              showMap(true)
            }
          >
            <Map
              style={{ width: "100%", height: "100%" }}
              defaultCenter={{ lat: Lat, lng: Lng }}
              defaultZoom={18}
              gestureHandling="greedy"
            ></Map>
          </APIProvider>
        )}
    </div>
  );
}
