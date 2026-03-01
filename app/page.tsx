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
      className="h-screen overflow-x-hidden overflow-y-auto overscroll-none"
    >
      <Header scrollContainer={scrollContainer as RefObject<HTMLDivElement>} />
      {apiKey && (
        <APIProvider apiKey={apiKey}>
          <div className="grid h-screen grid-cols-[auto_1fr] bg-(--color-brand-700) p-6 font-sans">
            <Fields
              onSubmitLocations={setLocations}
              onSetHotelCoords={setHotelCoords}
            />
            <Map locations={locations} hotelCoords={hotelCoords} /> <Footer />
          </div>
        </APIProvider>
      )}
    </div>
  );
}
