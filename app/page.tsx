"use client";

import { RefObject, useRef, useState } from "react";
import Header from "./components/header";
import Map from "./components/map";
import Fields from "./components/fields";
import Footer from "./components/footer";

type Coords = {
  lat: number;
  lng: number;
} | null;

export default function Home() {
  const [locations, setLocations] = useState<any[]>([]);
  const [hotelCoords, setHotelCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const scrollContainer = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollContainer}
      className="h-screen overflow-x-hidden overflow-y-auto overscroll-none"
    >
      <Header scrollContainer={scrollContainer as RefObject<HTMLDivElement>} />

      <div className="grid h-screen grid-rows-[1fr_auto] bg-(--color-brand-700) font-sans">
        <div className="flex flex-col overflow-hidden p-6 md:flex-row">
          <Fields
            onSubmitLocations={setLocations}
            onSetHotelCoords={setHotelCoords}
          />
          <Map locations={locations} hotelCoords={hotelCoords} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
