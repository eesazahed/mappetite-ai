import Header from "./components/header";
import Map from "./components/map";
import Fields from "./components/fields";

export default function Home() {
  return (
    <div className="h-screen overflow-x-hidden overflow-y-auto overscroll-none">
      <Header />

      <div className="grid h-screen grid-cols-[auto_1fr] bg-(--color-brand-700) p-6 font-sans">
        <Fields />
        <Map />
      </div>
    </div>
  );
}
