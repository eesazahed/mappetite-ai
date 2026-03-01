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
      <Header scrollContainer={scrollContainer as RefObject<HTMLDivElement>} />

      {apiKey && (
        <APIProvider apiKey={apiKey}>
          <div className="flex h-screen flex-col bg-(--color-brand-700) font-sans md:grid md:grid-rows-[1fr_auto]">
            <div className="relative flex md:flex-1 items-center justify-center p-6">
              <Fields
                onSubmitLocations={setLocations}
                onSetHotelCoords={setHotelCoords}
              />
              <div className="absolute inset-0 hidden">
                <Map locations={locations} hotelCoords={hotelCoords} />
              </div>
            </div>
            <Footer />
          </div>
        </APIProvider>
      )}
    </div>
  );
}
