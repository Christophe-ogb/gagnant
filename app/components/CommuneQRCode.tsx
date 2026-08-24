"use client";

import { Download, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const colors = ["#064E3B", "#0F4C5C", "#5B3A16", "#6B1E3A", "#1E3A5F", "#3F4F24", "#5A2D0C"];

function colorFor(slug: string) {
  return colors[[...slug].reduce((total, character) => total + character.charCodeAt(0), 0) % colors.length];
}

type CommuneQRCodeProps = {
  slug: string;
  communeNom: string;
  size?: number;
};

export function CommuneQRCode({ slug, communeNom, size = 224 }: CommuneQRCodeProps) {
  const url = `https://jeuxgagnants.bj/communes/${encodeURIComponent(slug)}`;
  const color = colorFor(slug);

  return (
    <section className="w-full max-w-sm rounded-3xl border border-gold/30 bg-white p-4 text-center shadow-[0_18px_42px_rgba(0,0,0,0.22)] sm:p-5" aria-label={`QR code de ${communeNom}`}>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#064E3B]">Scanner pour découvrir</p>
      <div className="mx-auto mt-3 grid aspect-square w-full max-w-56 place-items-center rounded-2xl bg-white p-2">
        <QRCodeSVG value={url} size={size} level="H" bgColor="#FFFFFF" fgColor={color} marginSize={4} title={`QR code : ${communeNom}`} className="h-auto max-w-full" />
      </div>
      <p className="mt-3 break-words text-base font-extrabold text-[#064E3B]">{communeNom}</p>
      <p className="mt-1 text-xs leading-5 text-[#064E3B]/70">Ce code contient le lien sécurisé vers la fiche de la commune.</p>
      <a href={`/api/qr/${encodeURIComponent(slug)}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ backgroundColor: color }}>
        <Download aria-hidden="true" size={17} /> Télécharger le PNG imprimeur
      </a>
      <span className="sr-only"><QrCode aria-hidden="true" /> URL : {url}</span>
    </section>
  );
}
