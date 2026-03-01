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

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#122018" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1a11" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7aab8a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9ec4ae" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#5f8f72" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a2f22" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#4f8a64" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e3829" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#172e20" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#89b89a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#264d38" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1c3a2b" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#7aab8a" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1a3024" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#6a9e7e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1f18" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d7558" }] },
];

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
      className="h-fit overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      style={{
        background: "rgba(255,255,255,0.045)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "6px",
      }}
    >
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ ...containerStyle, borderRadius: "16px" }}
          center={center}
          zoom={14}
          options={{
            zoomControl: true,
            scrollwheel: true,
            draggable: true,
            streetViewControl: false,
            mapTypeControl: false,
            styles: darkMapStyles,
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
