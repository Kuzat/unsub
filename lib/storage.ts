import * as BunnyStorageSDK from "@bunny.net/storage-sdk";
import {Readable} from "node:stream";
import {meter} from "@/lib/meter-provider";

const uploadLogoCDNCounter = meter.createCounter("upload_logo_cdn.count", {
  description: "Number of times putObject() was called",
})

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

    uploadLogoCDNCounter.add(1, {
      success: success ? "success" : "error",
    })
  } catch (error) {
    console.error(error)
    uploadLogoCDNCounter.add(1, {success: "error"})
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
