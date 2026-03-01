"use client";

import { RefObject, useRef, useState, useEffect } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Header from "./components/header";
import Map from "./components/map";
import Fields from "./components/fields";
import Footer from "./components/footer";

export default function Home() {
  const [locations, setLocations] = useState<any[]>([]);
  const [hotelCoords, setHotelCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/maps-key")
      .then((res) => res.json())
      .then((data) => setApiKey(data.apiKey));
  }, []);

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
                  />
                </div>

                <div
                  className="flex-shrink-0 transition-opacity duration-500 ease-in-out"
                  style={{
                    opacity: isReady ? 1 : 0,
                    pointerEvents: isReady ? "auto" : "none",
                  }}
                >
                  <Map locations={locations} hotelCoords={hotelCoords} />
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
