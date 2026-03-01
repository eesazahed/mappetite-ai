"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";

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
        width: "100%",
        height: "100%",
        opacity: mapVisible ? 1 : 0,
        transition: "opacity 1s ease",
        pointerEvents: mapVisible ? "auto" : "none",
      }}
    >
      {apiKey && (
        <APIProvider apiKey={apiKey} onLoad={() => showMap(true)}>
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
