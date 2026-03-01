"use client";

import { RefObject, useRef, useState } from "react";
import Header from "./components/header";
import Map from "./components/map";
import Fields from "./components/fields";

export default function Home() {
  const [locations, setLocations] = useState<any[]>([]);

  const scrollContainer = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollContainer}
      className="h-screen overflow-x-hidden overflow-y-auto overscroll-none"
    >
      <Header scrollContainer={scrollContainer as RefObject<HTMLDivElement>} />

      <div className="grid h-screen grid-cols-[auto_1fr] bg-(--color-brand-700) p-6 font-sans">
        <Fields onSubmitLocations={setLocations} />
        <Map locations={locations} />
      </div>
    </div>
  );
}
