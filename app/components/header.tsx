"use client";

import { useEffect, useState, RefObject } from "react";
import { FaArrowDown } from "react-icons/fa";
import Image from "next/image";
import TextType from './typetext';
import TextCursor from './trailcursor';

interface HeaderProps {
  scrollContainer: RefObject<HTMLDivElement | null>;
}

export default function Header({ scrollContainer }: HeaderProps) {
  const text = "Mappetite AI";
  const images = ["/imageOne.webp", "/imageTwo.webp", "/imageThree.webp"];
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
          setTimeout(() => setShowCursor(false), 1100);
          setTimeout(() => setShowLogo(true), 1200);
          setTimeout(() => {
            setAnimationDone(true);
            images.forEach((_, i) => {
              setTimeout(() => {
                setVisibleImages((prev) => [...prev, i]);
              }, i * 250);
            });
          }, 1800);
        }
      }, 55);
    }, startDelay);


    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;
    const handleScroll = () => {
      setArrowVisible(container.scrollTop < 200);
    };
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainer]);

  return (
    <div className="relative h-lvh w-full bg-linear-to-b from-(--color-brand-900) from-80% to-(--color-brand-700)">
      <TextCursor
        text="🍔"
        spacing={80}
        followMouseDirection
        randomFloat
        exitDuration={0.3}
        removalInterval={20}
        maxPoints={10}
      />
      <div className="absolute z-10 top-0 left-0 flex h-full w-full flex-col items-center justify-center pointer-events-none">
        <div
          className={`pointer-events-auto flex flex-col items-center justify-center transition-transform duration-700 ${animationDone ? "-translate-y-16" : "translate-y-0"
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
                    className={`animate-fade ml-1 h-[1em] w-0.75 
                      bg-gray-300 transition-opacity duration-500 
                      ${cursorFade ? "opacity-0" : "opacity-100"}`}
                  ></span>
                )}
              </span>
            </h1>
            <p className="mt-2 text-center text-2xl text-gray-400">
              <TextType
                text={["your personal foodie", "scrumptious restaurants", "search less, eat more"]}
                typingSpeed={75}
                initialDelay={1000}
                pauseDuration={1500}
                showCursor
                cursorCharacter="_"
                deletingSpeed={50}
                cursorBlinkDuration={0.5}
              />
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex gap-8">
          {images.map((src, i) => (
            <div
              key={i}
              className={`relative h-40 w-64 overflow-hidden rounded-2xl transition-all duration-700 ease-out ${visibleImages.includes(i)
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-6 scale-95 opacity-0"
                }`}
            >
              <Image
                src={src}
                alt={`Image ${i}`}
                fill
                sizes="256px"
                className="object-cover"
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
