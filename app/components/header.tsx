"use client";

import { useEffect, useState, RefObject } from "react";
import { FaArrowDown } from "react-icons/fa";
import Image from "next/image";

interface HeaderProps {
  scrollContainer: RefObject<HTMLDivElement | null>;
}

export default function Header({ scrollContainer }: HeaderProps) {
  const text = "Mappetite AI";
  const images = ["/image1.png", "/image2.png", "/image3.png"];
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [cursorFade, setCursorFade] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  const [arrowVisible, setArrowVisible] = useState(true);

  useEffect(() => {
    const startDelay = 250;
    let index = 0;

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, index + 1));
        index++;
        if (index === text.length) {
          clearInterval(interval);
          setTimeout(() => setCursorFade(true), 50);
          setTimeout(() => {
            setShowCursor(false);
            setAnimationDone(true);
            images.forEach((_, i) => {
              setTimeout(() => {
                setVisibleImages((prev) => [...prev, i]);
              }, i * 300);
            });
          }, 1050);
        }
      }, 55);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;
    const handleScroll = () => {
      const threshold = 200;
      setArrowVisible(container.scrollTop < threshold);
    };
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainer]);

  return (
    <div className="relative h-lvh w-full bg-(--color-brand-900)">
      <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
        <div
          className={`flex flex-col items-center justify-center transition-transform duration-700 ${
            animationDone ? "-translate-y-16" : "translate-y-0"
          }`}
        >
          <h1 className="text-center text-8xl leading-[1.2] text-gray-300">
            <span
              className="inline-flex items-center"
              style={{ minHeight: "1.2em" }}
            >
              <span>{displayed}</span>
              {showCursor && (
                <span
                  className={`animate-fade ml-1 h-[1em] w-0.75 bg-gray-300 transition-opacity duration-500 ${
                    cursorFade ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
              )}
            </span>
          </h1>

          <p className="mt-2 text-center text-2xl text-gray-400">
            your personal ai
          </p>
        </div>

        <div className="mt-6 flex space-x-4">
          {images.map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden transition-all duration-700 ${
                visibleImages.includes(i) ? "h-32" : "h-0"
              }`}
            >
              <Image
                src={src}
                alt={`Image ${i}`}
                width={1}
                height={1}
                className={`h-32 w-32 rounded-lg object-cover transition-opacity duration-700 ${
                  visibleImages.includes(i) ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <FaArrowDown
          size="2rem"
          className={`animate-bounce text-gray-300 transition-opacity duration-300 ${
            arrowVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <style>
        {`
          .animate-fade {
            animation: fade 1s linear infinite;
          }
          @keyframes fade {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
