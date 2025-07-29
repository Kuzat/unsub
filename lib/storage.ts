import * as BunnyStorageSDK from "@bunny.net/storage-sdk";
import {Readable} from "node:stream";

// Conditionally import meter to avoid OTEL issues in CLI scripts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let uploadLogoCDNCounter: any = null;
try {
  if (!process.env.OTEL_SDK_DISABLED) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {meter} = require("@/lib/meter-provider");
    uploadLogoCDNCounter = meter.createCounter("upload_logo_cdn.count", {
      description: "Number of times putObject() was called",
    });
  }
} catch {
  console.warn("Failed to initialize metrics, continuing without telemetry");
}

const sz_zone = process.env.BUNNY_STORAGE_ZONE!;
const access_key = process.env.BUNNY_STORAGE_ACCESS_KEY!;


const sz = BunnyStorageSDK.zone.connect_with_accesskey(BunnyStorageSDK.regions.StorageRegion.Falkenstein, sz_zone, access_key)

export async function putObject(key: string, file: Buffer, format: string, sha256Checksum?: string) {
  try {
    const fileStream = Readable.from(file)
    const webStream = Readable.toWeb(fileStream)
    const success = await BunnyStorageSDK.file.upload(sz, key, webStream, {
      sha256Checksum: sha256Checksum,
      contentType: format,
    })

    uploadLogoCDNCounter?.add(1, {
      success: success ? "success" : "error",
    })
  } catch (error) {
    console.error(error)
    uploadLogoCDNCounter?.add(1, {success: "error"})
    throw error;
  }
}

export async function exists(key: string) {
  try {
    await BunnyStorageSDK.file.get(sz, key)
    return true
  } catch {
    return false;
  }
}

export async function deleteObject(key: string) {
  try {
    await BunnyStorageSDK.file.remove(sz, key)
    return true
  } catch (error) {
    console.error(`Error deleting object ${key}:`, error)
    return false
  }
}

export async function listObjects(prefix: string = ""): Promise<string[]> {
  try {
    const objects = await BunnyStorageSDK.file.list(sz, prefix)
    return objects.map(obj => obj.objectName).filter(name => name !== undefined) as string[]
  } catch (error) {
    console.error(`Error listing objects with prefix ${prefix}:`, error)
    return []
  }
}
