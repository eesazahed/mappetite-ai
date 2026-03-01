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
          <div className="flex min-h-screen flex-col font-sans md:grid md:grid-rows-[1fr_auto]">
            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
              <div className="flex h-full w-full items-center justify-center transition-all duration-700 ease-in-out">
                <div
                  className={`flex-shrink-0 transition-transform duration-700 ease-in-out ${
                    isReady ? "-translate-x-1/2" : "translate-x-0"
                  }`}
                  style={{ zIndex: 10 }}
                >
                  <Fields
                    onSubmitLocations={setLocations}
                    onSetHotelCoords={setHotelCoords}
                  />
                </div>

                <div
                  className={`absolute top-0 left-0 h-full w-full transition-transform duration-700 ease-in-out ${
                    isReady ? "translate-x-0" : "translate-x-full"
                  }`}
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
