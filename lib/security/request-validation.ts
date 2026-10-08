import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";

async function readLimitedBody(request: NextRequest, maxBytes: number) {
  const reader = request.body?.getReader();
  if (!reader) return { success: true as const, bytes: new Uint8Array() };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { success: false as const };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { success: true as const, bytes };
}

export async function readJsonBody<Schema extends z.ZodType>(
  request: NextRequest,
  schema: Schema,
  options: { maxBytes: number; invalidMessage: string },
): Promise<{ success: true; data: z.infer<Schema> } | { success: false; response: NextResponse }> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > options.maxBytes) {
    return {
      success: false,
      response: NextResponse.json({ error: options.invalidMessage }, { status: 413, headers: { "Cache-Control": "no-store" } }),
    };
  }

  let body: Awaited<ReturnType<typeof readLimitedBody>>;
  try {
    body = await readLimitedBody(request, options.maxBytes);
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: options.invalidMessage }, { status: 400, headers: { "Cache-Control": "no-store" } }),
    };
  }
  if (!body.success) {
    return {
      success: false,
      response: NextResponse.json({ error: options.invalidMessage }, { status: 413, headers: { "Cache-Control": "no-store" } }),
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(body.bytes)) as unknown;
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: options.invalidMessage }, { status: 400, headers: { "Cache-Control": "no-store" } }),
    };
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: result.error.issues[0]?.message ?? options.invalidMessage },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      ),
    };
  }
  return { success: true, data: result.data };
}

export async function readFormDataBody(request: NextRequest, maxBytes: number) {
  const contentType = request.headers.get("content-type");
  if (!contentType?.toLowerCase().startsWith("multipart/form-data;")) {
    return {
      success: false as const,
      response: NextResponse.json({ error: "Le format de la fiche et de ses photos est invalide." }, { status: 400 }),
    };
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      success: false as const,
      response: NextResponse.json({ error: "La fiche ou ses photos dépassent la taille maximale autorisée." }, { status: 413 }),
    };
  }

  let body: Awaited<ReturnType<typeof readLimitedBody>>;
  try {
    body = await readLimitedBody(request, maxBytes);
  } catch {
    return {
      success: false as const,
      response: NextResponse.json({ error: "Les informations de la fiche sont invalides." }, { status: 400 }),
    };
  }
  if (!body.success) {
    return {
      success: false as const,
      response: NextResponse.json({ error: "La fiche ou ses photos dépassent la taille maximale autorisée." }, { status: 413 }),
    };
  }

  try {
    const formData = await new Response(body.bytes, { headers: { "Content-Type": contentType } }).formData();
    return { success: true as const, data: formData };
  } catch {
    return {
      success: false as const,
      response: NextResponse.json({ error: "Les informations de la fiche sont invalides." }, { status: 400 }),
    };
  }
}
