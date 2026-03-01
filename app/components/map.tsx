"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_GMAPS_API_KEY!;

export default function ExMap() {
  const Lat = 42.36
  const Lng = -71.09

  const [mapVisible, showMap] = useState(false)

  return (
    <div
        style={{
          width: "100%",
          height: "100%",
          opacity: mapVisible ? 1 : 0,
          transition: "opacity 1s ease",
          pointerEvents: mapVisible ? "auto" : "none"
        }}>

        <APIProvider
          apiKey={apiKey}
          onLoad={() => showMap(true)}
        >
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={{ lat: Lat, lng: Lng }}
            defaultZoom={18}
            gestureHandling="greedy"
          ></Map>
        </APIProvider>
    </div>
  );
}
