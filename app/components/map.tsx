"use client";

import { Fragment, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Map as GMap, Marker, useMap } from "@vis.gl/react-google-maps";

type Location = {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  rating?: number | null;
  price_level?: number | null;
  type?: string;
  cuisine?: string;
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

function InfoBox({ loc }: { loc: Location }) {
  const map = useMap();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map) return;

    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.pointerEvents = "none";

    const overlay = new google.maps.OverlayView();

    overlay.onAdd = function () {
      this.getPanes()!.floatPane.appendChild(div);
      setContainer(div);
    };

    overlay.draw = function () {
      const point = this.getProjection()?.fromLatLngToDivPixel(
        new google.maps.LatLng(loc.lat, loc.lng)
      );
      if (point) {
        div.style.left = `${point.x}px`;
        div.style.top = `${point.y}px`;
      }
    };

    overlay.onRemove = function () {
      div.parentNode?.removeChild(div);
      setContainer(null);
    };

    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, loc.lat, loc.lng]);

  if (!container) return null;

  const stars = loc.rating != null ? `★ ${loc.rating.toFixed(1)}` : null;
  const price = loc.price_level != null ? "$".repeat(loc.price_level) : null;

  return createPortal(
    <div
      style={{
        transform: "translate(-50%, calc(-100% - 14px))",
        background: "rgba(8, 20, 12, 0.93)",
        border: "1px solid rgba(90, 188, 185, 0.25)",
        borderRadius: "7px",
        padding: "5px 8px 4px",
        minWidth: "120px",
        maxWidth: "170px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.7)",
        lineHeight: 1,
      }}
    >
      {/* name */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#e0f2e9",
          marginBottom: "3px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "154px",
        }}
      >
        {loc.name}
      </div>

      {/* rating + price row */}
      {(stars || price) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "3px",
          }}
        >
          {stars && (
            <span style={{ fontSize: "10px", color: "#5abcb9", fontWeight: 600 }}>
              {stars}
            </span>
          )}
          {price && (
            <span
              style={{
                fontSize: "9px",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.04em",
              }}
            >
              {price}
            </span>
          )}
        </div>
      )}

      {/* address / description */}
      {loc.address && (
        <div
          style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "154px",
            marginBottom: loc.type ? "3px" : 0,
          }}
        >
          {loc.address}
        </div>
      )}

      {/* meal type badge */}
      {loc.type && (
        <div
          style={{
            display: "inline-block",
            fontSize: "8px",
            fontWeight: 600,
            color: "#3d9e6a",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            background: "rgba(57,158,90,0.12)",
            border: "1px solid rgba(57,158,90,0.25)",
            borderRadius: "3px",
            padding: "1px 5px",
          }}
        >
          {loc.type}
        </div>
      )}

      {/* pointer triangle */}
      <div
        style={{
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid rgba(90, 188, 185, 0.25)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "5px solid rgba(8, 20, 12, 0.93)",
        }}
      />
    </div>,
    container
  );
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
          <Fragment key={idx}>
            <Marker position={{ lat: loc.lat, lng: loc.lng }} />
            <InfoBox loc={loc} />
          </Fragment>
        ))}
      </GMap>
    </div>
  );
}
