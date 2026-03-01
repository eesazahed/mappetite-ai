"use client";

import { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  OverlayView,
} from "@react-google-maps/api";

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

const containerStyle = { width: "48vw", height: "600px" };

export default function MapComponent({ locations, hotelCoords }: MapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [center, setCenter] = useState({ lat: 42.36, lng: -71.09 });
  const [mounted, setMounted] = useState(false);

  // Ensure map only renders on client
  useEffect(() => {
    setMounted(true);
    fetch("/api/maps-key")
      .then((res) => res.json())
      .then((data) => setApiKey(data.apiKey));
  }, []);

  useEffect(() => {
    if (hotelCoords) setCenter(hotelCoords);
    else if (locations.length > 0) setCenter(locations[0]);
  }, [hotelCoords, locations]);

  if (!mounted || !apiKey) return null; // prevent SSR hydration issues

  return (
    <div
      className="h-fit rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
      style={{ marginLeft: "40px" }}
    >
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          options={{
            zoomControl: true,
            scrollwheel: true,
            draggable: true,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {locations.map((loc, idx) => (
            <div key={idx}>
              <Marker position={{ lat: loc.lat, lng: loc.lng }} />

              <OverlayView
                position={{ lat: loc.lat, lng: loc.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  style={{
                    minWidth: "100px",
                    background: "white",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    maxWidth: "220px",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                  }}
                >
                  {loc.day && (
                    <div style={{ fontWeight: "bold" }}>Day {loc.day}</div>
                  )}
                  <a
                    href={loc.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline", color: "#1a73e8" }}
                  >
                    {loc.name}
                  </a>
                  {loc.cuisine && <div>{loc.cuisine}</div>}
                  {loc.openHours && <div>{loc.openHours}</div>}
                </div>
              </OverlayView>
            </div>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
