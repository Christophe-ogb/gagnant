import QRCode from "qrcode";
import patrimoine from "@/data/patrimoine.json";

export const runtime = "nodejs";

const colors = ["#064E3B", "#0F4C5C", "#5B3A16", "#6B1E3A", "#1E3A5F", "#3F4F24", "#5A2D0C"];

function colorFor(slug) {
  return colors[[...slug].reduce((total, character) => total + character.charCodeAt(0), 0) % colors.length];
}

export async function GET(_request, { params }) {
  const { slug } = await params;
  const commune = patrimoine.find((item) => item.id === slug && item.type === "commune");

  if (!commune) {
    return Response.json({ error: "Commune introuvable" }, { status: 404 });
  }

  const value = `https://jeuxgagnants.bj/communes/${encodeURIComponent(slug)}`;
  const png = await QRCode.toBuffer(value, {
    type: "png",
    width: 1200,
    margin: 5,
    errorCorrectionLevel: "H",
    color: { dark: colorFor(slug), light: "#FFFFFFFF" },
  });

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${slug}.png"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
