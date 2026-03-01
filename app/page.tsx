"use client";

import { RefObject, useRef, useState, useEffect } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Header from "./components/header";
import Map from "./components/map";
import Fields from "./components/fields";
import Footer from "./components/footer";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{
      background: "rgba(20, 8, 8, 0.96)",
      border: "1px solid rgba(220, 60, 60, 0.35)",
      borderRadius: "10px",
      padding: "11px 14px",
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
      maxWidth: "300px",
      minWidth: "220px",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      animation: "toastIn 0.2s ease-out",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#f87171",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "3px",
        }}>
          Error
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "18px",
          lineHeight: 1,
          background: "none",
          border: "none",
          cursor: "pointer",
          paddingTop: "1px",
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function Home() {
  const [locations, setLocations] = useState<any[]>([]);
  const [hotelCoords, setHotelCoords] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [attractions, setAttractions] = useState<{ lat: number; lng: number; name: string; address: string }[]>([]);
  const [daySchedules, setDaySchedules] = useState<{ day: number; meals: any[]; orderedWaypoints: { lat: number; lng: number; name: string; stopType: "meal" | "attraction" }[] }[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/maps-key")
      .then((res) => res.json())
      .then((data) => setApiKey(data.apiKey));
  }, []);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((n) => n.id !== id)), 6000);
  };

  const isReady = locations.length > 0 && hotelCoords;

  return (
    <div
      ref={scrollContainer}
      style={{
        background:
          "radial-gradient(ellipse at 78% 5%, rgba(90,188,185,0.07) 0%, transparent 28%), radial-gradient(ellipse at 12% 62%, rgba(38,83,43,0.5) 0%, transparent 40%), linear-gradient(to bottom, #26532b 0%, #1a3520 18%, #0d2015 42%, #0b1a0e 62%)",
      }}
      className="h-screen overflow-x-hidden overflow-y-auto overscroll-none"
    >
      <Header scrollContainer={scrollContainer as RefObject<HTMLDivElement>} />

      {/* Toast container */}
      <div style={{
        position: "fixed",
        top: "80px",
        right: "24px",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            onClose={() => setToasts((ts) => ts.filter((n) => n.id !== t.id))}
          />
        ))}
      </div>

      {apiKey && (
        <APIProvider apiKey={apiKey}>
          <div className="flex min-h-screen flex-col font-sans">
            {/* overflow-hidden clips the row while it slides in */}
            <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
              {/*
                Both panels in a normal flex row.
                When map is hidden, shift the row right so Fields stays centered.
                Offset ≈ (map width 612px + gap 24px) / 2 = 318px
              */}
              <div
                className="flex flex-shrink-0 items-center gap-6 transition-transform duration-700 ease-in-out"
                style={{
                  transform: isReady ? "translateX(0)" : "translateX(318px)",
                }}
              >
                <div className="flex-shrink-0">
                  <Fields
                    onSubmitLocations={setLocations}
                    onSetHotelCoords={setHotelCoords}
                    onSetAttractions={setAttractions}
                    onSetDaySchedules={setDaySchedules}
                    onError={addToast}
                    onLoadingChange={setLoading}
                  />
                </div>

                <div
                  className="flex-shrink-0 transition-opacity duration-500 ease-in-out"
                  style={{
                    opacity: isReady ? 1 : 0,
                    pointerEvents: isReady ? "auto" : "none",
                  }}
                >
                  <Map
                    locations={locations}
                    hotelCoords={hotelCoords}
                    attractions={attractions}
                    daySchedules={daySchedules}
                    loading={loading}
                  />
                </div>
              </div>
            </div>

            <Footer />
          </div>
        </APIProvider>
      )}
    </div>
  );
}
