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

  return (
    <div
      ref={scrollContainer}
      className="flex h-screen flex-col overflow-x-hidden overflow-y-auto"
    >
      {/* Single continuous background spanning both sections */}
      <div
        style={{
          background:
            "radial-gradient(ellipse at 78% 5%, rgba(90,188,185,0.07) 0%, transparent 28%), radial-gradient(ellipse at 12% 62%, rgba(38,83,43,0.5) 0%, transparent 40%), linear-gradient(to bottom, #26532b 0%, #1a3520 18%, #0d2015 42%, #0b1a0e 62%)",
        }}
      >
        <Header scrollContainer={scrollContainer as RefObject<HTMLDivElement>} />
        {apiKey && (
          <APIProvider apiKey={apiKey}>
            <div className="grid h-screen grid-rows-[1fr_auto] font-sans">
              <div className="flex flex-col items-start justify-center gap-6 overflow-hidden p-8 md:flex-row">
                <Fields
                  onSubmitLocations={setLocations}
                  onSetHotelCoords={setHotelCoords}
                />
                <Map locations={locations} hotelCoords={hotelCoords} />
              </div>
              <Footer />
            </div>
          </APIProvider>
        )}
      </div>
    </div>
  );
}
