"use client";

import { MapPinned } from "lucide-react";
import { useState } from "react";

type CardImageProps = {
  src: string;
  alt: string;
  position: string;
};

export function CardImage({ src, alt, position }: CardImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-42 shrink-0 overflow-hidden bg-[#21160f]">
      <MapPinned className="absolute inset-0 m-auto text-gold/45" aria-hidden="true" size={30} />
      {!failed && <img src={src} alt={alt} onError={() => setFailed(true)} className={`relative z-[1] h-full w-full object-cover ${position} transition duration-500 group-hover:scale-105`} />}
    </div>
  );
}