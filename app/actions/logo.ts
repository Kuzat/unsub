"use server"
import {createHash} from "node:crypto";
import sharp from "sharp";
import {putObject} from "@/lib/storage";
import {requireSession} from "@/lib/auth";

const LOGO_CDN_URL = process.env.LOGO_CDN_URL!;

type FetchLogoResponse = {
  error?: string,
  logo_cdn_url?: string,
  logo_hash?: string,
}

export async function fetchLogo(originalUrl: string): Promise<FetchLogoResponse> {
  // Auth
  await requireSession()

  try {
    new URL(originalUrl)
  } catch {
    return {error: 'Invalid URL'}
  }

  // Stream and size-cap
  const r = await fetch(originalUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/*',
    },
    signal: AbortSignal.timeout(10000), // 10 second timeout
  });

  if (!r.ok) {
    return {error: 'Error fetching logo'}
  }
  if (!r.headers.get('Content-Type')?.startsWith('image/')) {
    return {error: 'Invalid image type'}
  }

  // Process in memory
  const fileBuf = Buffer.from(await r.arrayBuffer());
  const hash = createHash("sha256").update(fileBuf).digest("hex");
  const optimized = await sharp(fileBuf)
    .resize(256, 256, {fit: "contain", background: {r: 255, g: 255, b: 255, alpha: 0}})
    .toFormat("webp")
    .toBuffer();

  const key = `logo/${hash}.webp`
  try {
    await putObject(key, optimized, "image/webp")
  } catch (e) {
    console.error(e)
    return {error: 'Error uploading logo'}
  }

  return {
    logo_cdn_url: `${LOGO_CDN_URL}/${key}`,
    logo_hash: hash,
  }
}