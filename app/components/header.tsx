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
  const [showLogo, setShowLogo] = useState(false);
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
            setShowLogo(true);
          }, 1050);
          setTimeout(() => {
            setAnimationDone(true);
            images.forEach((_, i) => {
              setTimeout(() => {
                setVisibleImages((prev) => [...prev, i]);
              }, i * 300);
            });
          }, 1850);
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
          className={`flex flex-col items-center justify-center transition-transform duration-700 ${animationDone ? "-translate-y-16" : "translate-y-0"
            }`}
        >
          <div className="relative">
            <Image
              src="/map-logo.svg"
              alt="Mappetite Logo"
              width={110}
              height={110}
              className={`logo-entrance ${showLogo ? "logo-visible" : ""}`}
              style={{
                filter: "none",
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -160%) scale(0)",
                zIndex: 0,
              }}
            />
            <h1 className="relative z-10 text-center text-8xl leading-[1.2] text-gray-300">
              <span
                className="inline-flex items-center"
                style={{ minHeight: "1.2em" }}
              >
                <span>{displayed}</span>
                {showCursor && (
                  <span
                    className={`animate-fade ml-1 h-[1em] w-0.75 bg-gray-300 transition-opacity duration-500 ${cursorFade ? "opacity-0" : "opacity-100"
                      }`}
                  ></span>
                )}
              </span>
            </h1>
          </div>

          <p className="mt-2 text-center text-2xl text-gray-400">
            your personal ai
          </p>
        </div>

        <div className="mt-6 flex space-x-4">
          {images.map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden transition-all duration-700 ${visibleImages.includes(i) ? "h-32" : "h-0"
                }`}
            >
              <Image
                src={src}
                alt={`Image ${i}`}
                width={1}
                height={1}
                className={`h-32 w-32 rounded-lg object-cover transition-opacity duration-700 ${visibleImages.includes(i) ? "opacity-100" : "opacity-0"
                  }`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <FaArrowDown
          size="2rem"
          className={`animate-bounce text-gray-300 transition-opacity duration-300 ${arrowVisible ? "opacity-100" : "opacity-0"
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
          .logo-entrance {
            opacity: 0;
          }
          .logo-entrance.logo-visible {
            animation: logoEnter 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                       logoBounce 2s ease-in-out 0.7s infinite;
          }
          @keyframes logoEnter {
            0% { opacity: 0; transform: translate(-50%, -160%) scale(0); }
            60% { opacity: 1; transform: translate(-50%, -160%) scale(1.1); }
            80% { transform: translate(-50%, -160%) scale(0.95); }
            100% { opacity: 1; transform: translate(-50%, -160%) scale(1); }
          }
          @keyframes logoBounce {
            0%, 100% { transform: translate(-50%, -160%) scale(1); }
            50% { transform: translate(-50%, calc(-160% - 12px)) scale(1); }
          }
        `}
      </style>
    </div>
  );
}
