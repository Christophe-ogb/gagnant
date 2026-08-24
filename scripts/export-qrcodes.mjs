import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import patrimoine from "../data/patrimoine.json" with { type: "json" };

const colors = ["#064E3B", "#0F4C5C", "#5B3A16", "#6B1E3A", "#1E3A5F", "#3F4F24", "#5A2D0C"];
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "out_qrcodes");
const communes = patrimoine.filter((item) => item.type === "commune");

function colorFor(slug) {
  return colors[[...slug].reduce((total, character) => total + character.charCodeAt(0), 0) % colors.length];
}

await mkdir(outputDirectory, { recursive: true });

for (const commune of communes) {
  const value = `https://jeuxgagnants.bj/communes/${encodeURIComponent(commune.id)}`;
  const png = await QRCode.toBuffer(value, {
    type: "png",
    width: 1400,
    margin: 6,
    errorCorrectionLevel: "H",
    color: { dark: colorFor(commune.id), light: "#FFFFFFFF" },
  });

  await writeFile(path.join(outputDirectory, `qr-${commune.id}.png`), png);
}

console.log(`${communes.length} QR codes créés dans ${outputDirectory}`);
