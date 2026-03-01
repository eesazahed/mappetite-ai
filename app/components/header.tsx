import { FaArrowDown } from "react-icons/fa";

export default function Header() {
  return (
    <div className="flex h-lvh w-full flex-col items-center bg-(--color-brand-900)">
      <div className="flex flex-col flex-1 items-center justify-center">
        <h1 className="text-5xl text-gray-300 ">Mappetite AI</h1>
        <p>your personal ai</p>
      </div>

      <FaArrowDown size={"2rem"} className="mb-6 animate-bounce" />
    </div>
  );
}
