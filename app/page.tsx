import Header from "./components/header";
import Map from "./components/map";
import FoodInfo from "./components/foodInfo";
import Fields from "./components/fields";

export default function Home() {
  return (
    <div className="h-screen overflow-y-auto overscroll-none overflow-x-hidden">
      <Header />

      <div className="grid grid-cols-[auto_1fr] bg-(--color-brand-700) font-sans h-screen p-6">
        <Fields />
        <FoodInfo />
        <Map />
      </div>
    </div>
  );
}
