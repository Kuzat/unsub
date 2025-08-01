"use server"
import {createHash} from "node:crypto";
import sharp from "sharp";
import {exists, putObject} from "@/lib/storage";
import {requireSession} from "@/lib/auth";
import {validateExternalUrl} from "@/lib/utils";

const LOGO_CDN_URL = process.env.LOGO_CDN_URL!;
const MAX_LOGO_SIZE = 1 * 1024 * 1024; // 1 MB limit

type FetchLogoResponse = {
  error: string,
} | {
  logoCdnUrl: string,
  logoHash: string,
}

export async function fetchLogo(originalUrl: string): Promise<FetchLogoResponse> {
  // Auth
  await requireSession()

  if (!validateExternalUrl(originalUrl)) {
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

  const contentLength = r.headers.get('Content-Length')
  if (contentLength && parseInt(contentLength, 10) > MAX_LOGO_SIZE) {
    r.body?.cancel();
    return {
      error: `Logo size is greater than ${MAX_LOGO_SIZE / 1024 / 1024}MB`
    }
  }

  if (!r.body) {
    return {error: 'No logo data'}
  }

  const reader = r.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  while (true) {
    const {done, value} = await reader.read();
    if (done) {
      break;
    }

    chunks.push(value)
    receivedLength += value?.length

    if (receivedLength > MAX_LOGO_SIZE) {
      await reader.cancel()
      return {
        error: `Logo size is greater than ${MAX_LOGO_SIZE / 1024 / 1024}MB`
      }
    }
  }

  // Process in memory
  const fileBuf = Buffer.concat(chunks);
  const hash = createHash("sha256").update(fileBuf).digest("hex");
  const optimized = await sharp(fileBuf)
    .resize(256, 256, {fit: "contain", background: {r: 255, g: 255, b: 255, alpha: 0}})
    .toFormat("webp")
    .toBuffer();

  const key = `logo/${hash}.webp`
  // Since the key is the hash of the file, that means if it exists, then we should have the exact same picture
  // and do not need to upload it again.
  const keyExists = await exists(key)
  if (!keyExists) {
    try {
      await putObject(key, optimized, "image/webp")
    } catch (e) {
      console.error(e)
      return {error: 'Error uploading logo'}
    }
  }

  return {
    logoCdnUrl: `${LOGO_CDN_URL}/${key}`,
    logoHash: hash,
  }
}