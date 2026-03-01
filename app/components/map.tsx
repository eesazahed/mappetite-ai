"use client";

import { useState, useEffect } from "react";
import { Map as GMap, Marker, useMap } from "@vis.gl/react-google-maps";

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
  const [center, setCenter] = useState({ lat: 42.36, lng: -71.09 });

  useEffect(() => {
    if (hotelCoords) setCenter(hotelCoords);
    else if (locations.length)
      setCenter({ lat: locations[0].lat, lng: locations[0].lng });
  }, [hotelCoords, locations]);

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
      <GMap
        style={{ width: "600px", height: "500px", borderRadius: "16px" }}
        center={center}
        zoom={14}
        gestureHandling="greedy"
        zoomControl={true}
        streetViewControl={false}
        mapTypeControl={false}
        styles={darkMapStyles}
      >
        <PanTo center={center} />
        {locations.map((loc, idx) => (
          <Marker key={idx} position={{ lat: loc.lat, lng: loc.lng }} />
        ))}
      </GMap>
    </div>
  );
}
