"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState } from "react";

export default function ExMap() {

  const Lat = 42.36
  const Lng = -71.09

  const [mapVisible, showMap] = useState(false)

  return (
    <div className="bg-gray p-4 w-full h-full"

        style={{
          opacity: mapVisible ? 1 : 0,
          transition: "opacity 1s ease",
          pointerEvents: mapVisible ? "auto" : "none"
        }}>

        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GMAPS_API_KEY!}
          onLoad={() => 
            showMap(true)
          }
        >
          <Map
            className="w-full h-full"
            defaultCenter={{ lat: Lat, lng: Lng }}
            defaultZoom={18}
            gestureHandling="greedy"
            
          ></Map>
        </APIProvider>
    </div>
  );
}
