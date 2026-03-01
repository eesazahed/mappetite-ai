"use client";

import { useEffect, useState, RefObject } from "react";
import { FaArrowDown } from "react-icons/fa";
import Image from "next/image";
import TextType from "./typetext";
import TextCursor from "./trailcursor";

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
    const isMobile = window.innerWidth < 768;
    const typingSpeed = isMobile ? 40 : 55;
    const imageDelay = isMobile ? 150 : 250;

    const startDelay = 200;
    let index = 0;

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, index + 1));
        index++;
        if (index === text.length) {
          clearInterval(interval);
          setTimeout(() => setCursorFade(true), 50);
          setTimeout(() => setShowCursor(false), 900);
          setTimeout(() => setShowLogo(true), 1000);
          setTimeout(() => {
            setAnimationDone(true);
            images.forEach((_, i) => {
              setTimeout(() => {
                setVisibleImages((prev) => [...prev, i]);
              }, i * imageDelay);
            });
          }, 1400);
        }
      }, typingSpeed);
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
    <div className="grid min-h-screen w-full grid-rows-[1fr_auto] overflow-hidden bg-transparent">
      <TextCursor
        text="🍔"
        spacing={80}
        followMouseDirection
        randomFloat
        exitDuration={0.3}
        removalInterval={20}
        maxPoints={10}
      />
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <div
          className={`flex flex-col items-center transition-all duration-700 ${
            animationDone ? "mb-2 md:mb-10" : ""
          }`}
        >
          <div
            className={`overflow-hidden transition-all duration-500 ${
              showLogo
                ? "mb-4 max-h-32 scale-100 opacity-100 md:mb-6 md:max-h-40"
                : "max-h-0 scale-90 opacity-0"
            }`}
          >
            <Image
              src="/map-logo.svg"
              alt="Mappetite Logo"
              width={90}
              height={90}
              className="md:h-[110px] md:w-[110px]"
            />
          </div>

          <h1 className="text-4xl leading-tight text-gray-300 sm:text-5xl md:text-8xl">
            <span className="inline-flex min-h-[1.2em] items-center">
              <span>{displayed}</span>
              {showCursor && (
                <span
                  className={`ml-1 h-[1em] w-[2px] bg-gray-300 transition-opacity duration-500 ${
                    cursorFade ? "opacity-0" : "animate-pulse opacity-100"
                  }`}
                />
              )}
            </span>
          </h1>

          <p className="mt-3 max-w-xs text-lg text-gray-400 sm:max-w-md sm:text-xl md:mt-2 md:max-w-none md:text-2xl">
            <TextType
              text={[
                "your personal foodie",
                "scrumptious restaurants",
                "search less, eat more",
              ]}
              typingSpeed={60}
              initialDelay={800}
              pauseDuration={1200}
              showCursor
              cursorCharacter="_"
              deletingSpeed={40}
              cursorBlinkDuration={0.5}
            />
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6 md:gap-8">
          {images.map((src, i) => (
            <div
              key={i}
              className={`relative h-24 w-40 overflow-hidden rounded-xl transition-all duration-500 ease-out sm:h-32 sm:w-56 md:h-40 md:w-64 md:rounded-2xl ${
                visibleImages.includes(i)
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0"
              }`}
            >
              <Image
                src={src}
                alt={`Image ${i}`}
                fill
                sizes="(max-width: 768px) 160px, 256px"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-center pb-6">
        <FaArrowDown
          size="1.75rem"
          className={`animate-bounce text-gray-300 transition-opacity duration-300 ${
            arrowVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
