"use client";

import React, { Fragment, useState, useEffect } from "react";
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

type DaySchedule = {
  day: number;
  orderedWaypoints: { lat: number; lng: number; name: string; stopType: "meal" | "attraction" }[];
};

type MapProps = {
  locations: Location[];
  hotelCoords: { lat: number; lng: number; name: string } | null;
  attractions?: { lat: number; lng: number; name: string }[];
  daySchedules?: DaySchedule[];
  loading?: boolean;
};

function PanTo({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.panTo(center);
  }, [center, map]);
  return null;
}

function PinnedOverlay({
  lat,
  lng,
  children,
}: {
  lat: number;
  lng: number;
  children: React.ReactNode;
}) {
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
        new google.maps.LatLng(lat, lng)
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
  }, [map, lat, lng]);

  if (!container) return null;
  return createPortal(children, container);
}

const boxBase: React.CSSProperties = {
  transform: "translate(-50%, calc(-100% - 14px))",
  background: "rgba(8, 20, 12, 0.93)",
  borderRadius: "7px",
  padding: "5px 8px 4px",
  maxWidth: "170px",
  backdropFilter: "blur(16px)",
  boxShadow: "0 4px 18px rgba(0,0,0,0.7)",
  lineHeight: 1,
};

function Triangle({ borderColor }: { borderColor: string }) {
  return (
    <>
      <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `6px solid ${borderColor}` }} />
      <div style={{ position: "absolute", bottom: "-5px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgba(8, 20, 12, 0.93)" }} />
    </>
  );
}

function NumberBadge({ index, bg }: { index: number; bg: string }) {
  return (
    <div style={{
      width: "18px", height: "18px", borderRadius: "50%",
      background: bg, color: "#fff",
      fontSize: "10px", fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, marginRight: "5px",
    }}>
      {index}
    </div>
  );
}

function InfoBox({ loc, index }: { loc: Location; index?: number }) {
  const stars = loc.rating != null ? `★ ${loc.rating.toFixed(1)}` : null;
  const price = loc.price_level != null ? "$".repeat(loc.price_level) : null;

  return (
    <PinnedOverlay lat={loc.lat} lng={loc.lng}>
      <div style={{ ...boxBase, minWidth: "120px", border: "1px solid rgba(90, 188, 185, 0.25)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#e0f2e9", marginBottom: "3px", display: "flex", alignItems: "center" }}>
          {index !== undefined && <NumberBadge index={index} bg="#399e5a" />}
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "136px" }}>
            {loc.name}
          </span>
        </div>

        {(stars || price) && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
            {stars && <span style={{ fontSize: "10px", color: "#5abcb9", fontWeight: 600 }}>{stars}</span>}
            {price && <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>{price}</span>}
          </div>
        )}

        {loc.address && (
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "154px", marginBottom: loc.type ? "3px" : 0 }}>
            {loc.address}
          </div>
        )}

        {loc.type && (
          <div style={{ display: "inline-block", fontSize: "8px", fontWeight: 600, color: "#3d9e6a", textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(57,158,90,0.12)", border: "1px solid rgba(57,158,90,0.25)", borderRadius: "3px", padding: "1px 5px" }}>
            {loc.type}
          </div>
        )}

        <Triangle borderColor="rgba(90, 188, 185, 0.25)" />
      </div>
    </PinnedOverlay>
  );
}

function HotelInfoBox({ name, lat, lng, index }: { name: string; lat: number; lng: number; index: number }) {
  return (
    <PinnedOverlay lat={lat} lng={lng}>
      <div style={{ ...boxBase, minWidth: "80px", border: "1px solid rgba(90, 188, 185, 0.45)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#5abcb9", marginBottom: "3px", display: "flex", alignItems: "center" }}>
          <NumberBadge index={index} bg="#5abcb9" />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "136px" }}>
            {name}
          </span>
        </div>
        <div style={{ display: "inline-block", fontSize: "8px", fontWeight: 600, color: "#5abcb9", textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(90,188,185,0.12)", border: "1px solid rgba(90,188,185,0.3)", borderRadius: "3px", padding: "1px 5px" }}>
          Hotel
        </div>
        <Triangle borderColor="rgba(90, 188, 185, 0.45)" />
      </div>
    </PinnedOverlay>
  );
}

function AttractionInfoBox({ name, lat, lng, index }: { name: string; lat: number; lng: number; index?: number }) {
  return (
    <PinnedOverlay lat={lat} lng={lng}>
      <div style={{ ...boxBase, minWidth: "80px", border: "1px solid rgba(245, 200, 66, 0.35)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#f5c842", marginBottom: "3px", display: "flex", alignItems: "center" }}>
          {index !== undefined && <NumberBadge index={index} bg="#d4a017" />}
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "136px" }}>
            {name}
          </span>
        </div>
        <div style={{ display: "inline-block", fontSize: "8px", fontWeight: 600, color: "#d4a017", textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.25)", borderRadius: "3px", padding: "1px 5px" }}>
          Sight
        </div>
        <Triangle borderColor="rgba(245, 200, 66, 0.35)" />
      </div>
    </PinnedOverlay>
  );
}

function DayRoutes({
  hotel,
  daySchedules,
}: {
  hotel: { lat: number; lng: number };
  daySchedules: DaySchedule[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !daySchedules.length) return;

    const service = new google.maps.DirectionsService();
    const renderers: google.maps.DirectionsRenderer[] = [];

    daySchedules.forEach(({ orderedWaypoints }) => {
      if (!orderedWaypoints.length) return;

      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: "#f5c842",
          strokeOpacity: 0.75,
          strokeWeight: 4,
        },
      });

      service.route(
        {
          origin: hotel,
          destination: hotel,
          waypoints: orderedWaypoints.map((wp) => ({
            location: new google.maps.LatLng(wp.lat, wp.lng),
            stopover: true,
          })),
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            renderer.setDirections(result);
          }
        }
      );

      renderers.push(renderer);
    });

    return () => renderers.forEach((r) => r.setMap(null));
  }, [map, hotel, daySchedules]);

  return null;
}

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#122018" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1a11" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7aab8a" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ec4ae" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5f8f72" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1a2f22" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4f8a64" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e3829" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#172e20" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#89b89a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#264d38" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1c3a2b" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7aab8a" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1a3024" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6a9e7e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0c1f18" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d7558" }],
  },
];

export default function MapComponent({ locations, hotelCoords, attractions, daySchedules, loading }: MapProps) {
  const [center, setCenter] = useState({ lat: 42.36, lng: -71.09 });

  useEffect(() => {
    if (hotelCoords) setCenter(hotelCoords);
    else if (locations.length)
      setCenter({ lat: locations[0].lat, lng: locations[0].lng });
  }, [hotelCoords, locations]);

  // Build a map from "lat,lng" key → route order index (1-based, hotel is 0)
  const routeIndexMap = new Map<string, number>();
  daySchedules?.[0]?.orderedWaypoints.forEach((wp, i) => {
    routeIndexMap.set(`${wp.lat.toFixed(5)},${wp.lng.toFixed(5)}`, i + 1);
  });

  return (
    <div
      className="rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.045)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "6px",
        width: "612px",
        height: "512px",
        boxSizing: "border-box",
      }}
    >
      <GMap
        style={{
          width: "600px",
          height: "500px",
          borderRadius: "16px",
          opacity: loading ? 0.3 : 1,
          transition: "opacity 0.3s ease",
        }}
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="greedy"
        zoomControl={true}
        streetViewControl={false}
        mapTypeControl={false}
        styles={darkMapStyles}
      >
        <PanTo center={center} />
        {hotelCoords && daySchedules && daySchedules.length > 0 && (
          <DayRoutes hotel={hotelCoords} daySchedules={daySchedules} />
        )}
        {hotelCoords && (
          <Fragment>
            <Marker
              position={hotelCoords}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#5abcb9",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2.5,
              }}
            />
            <HotelInfoBox name={hotelCoords.name} lat={hotelCoords.lat} lng={hotelCoords.lng} index={0} />
          </Fragment>
        )}
        {attractions?.map((a, i) => {
          const key = `${a.lat.toFixed(5)},${a.lng.toFixed(5)}`;
          return (
            <Fragment key={`attraction-${i}`}>
              <Marker
                position={{ lat: a.lat, lng: a.lng }}
                title={a.name}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: "#f5c842",
                  fillOpacity: 0.95,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                }}
              />
              <AttractionInfoBox name={a.name} lat={a.lat} lng={a.lng} index={routeIndexMap.get(key)} />
            </Fragment>
          );
        })}
        {locations.map((loc, idx) => {
          const key = `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`;
          return (
            <Fragment key={idx}>
              <Marker position={{ lat: loc.lat, lng: loc.lng }} />
              <InfoBox loc={loc} index={routeIndexMap.get(key)} />
            </Fragment>
          );
        })}
      </GMap>

      {loading && (
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          borderRadius: "18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          pointerEvents: "none",
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid rgba(90,188,185,0.2)",
            borderTop: "3px solid #5abcb9",
            animation: "spin 0.9s linear infinite",
          }} />
          <p style={{
            color: "#5abcb9",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            Planning your trip…
          </p>
        </div>
      )}
    </div>
  );
}
