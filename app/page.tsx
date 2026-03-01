import Header from "./components/header";
import Map from "./components/map";
import FoodInfo from "./components/foodInfo";
import Fields from "./components/fields";

export default function Home() {
  return (
    <>
      <Header />
      <div className="grid grid-cols-[auto_1fr] min-h-screen bg-gray-400 font-sans dark:bg-gray-400 p-4">
        <Fields />
        <Map />
      </div>
    </>
  );
}
