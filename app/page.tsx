import Header from "./components/header";
import Map from "./components/map";
import FoodInfo from "./components/foodInfo";

export default function Home() {
  return (
    <div className="h-screen overflow-y-auto overscroll-none overflow-x-hidden">
      <Header />

      <div className="grid grid-cols-[auto_1fr] bg-(--color-brand-700) font-sans h-screen p-6">
        <FoodInfo />
        <Map />
      </div>
    </div>
  );
}
