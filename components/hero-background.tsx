"use client";

import { useEffect, useState } from "react";

const HERO_IMAGES = [
  { src: "/games/amazone.jpg", position: "object-[60%_25%]" },
  { src: "/games/hero-patrimoine-benin.jpg", position: "object-[65%_48%]" },
] as const;

const CHANGE_INTERVAL = 5 * 60 * 1000;

export function HeroBackground() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_IMAGES.length);
    }, CHANGE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      {HERO_IMAGES.map((image, index) => (
        <img
          key={image.src}
          src={image.src}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover ${image.position} transition-opacity duration-1000 ${activeImage === index ? "opacity-60" : "opacity-0"}`}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(26,18,11,0.98)_0%,rgba(26,18,11,0.88)_43%,rgba(26,18,11,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,#1a120b_0%,transparent_42%)]" />
    </>
  );
}