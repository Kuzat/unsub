"use server"

import {createHash} from "node:crypto";
import sharp from "sharp";
import {exists, putObject} from "@/lib/storage";
import {requireSession} from "@/lib/auth";
import {db} from "@/db";
import {guideImage, guide} from "@/db/schema/app";
import {eq} from "drizzle-orm";
import crypto from "crypto";

const GUIDE_IMAGE_CDN_URL = process.env.LOGO_CDN_URL!; // Reuse same CDN
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB limit for guide images
const MAX_IMAGE_WIDTH = 1200; // Max width for optimization
const MAX_IMAGE_HEIGHT = 800; // Max height for optimization

/**
 * Get or create a guide for a service
 * @param serviceId The service ID
 * @returns The guide ID
 */
async function getOrCreateGuide(serviceId: string): Promise<string> {
  const existingGuide = await db.query.guide.findFirst({
    where: eq(guide.serviceId, serviceId)
  })
  
  if (existingGuide) {
    return existingGuide.id
  }
  
  // Create new guide if none exists
  const newGuideId = crypto.randomUUID()
  await db.insert(guide).values({
    id: newGuideId,
    serviceId,
    currentVersionId: null, // Will be set when first version is approved
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  
  return newGuideId
}

type UploadGuideImageResponse = {
  error: string,
} | {
  success: {
    cdnUrl: string;
    markdown: string;
    imageId: string;
  }
}

export async function uploadGuideImage(formData: FormData): Promise<UploadGuideImageResponse> {
  // Auth
  await requireSession()

  try {
    const file = formData.get('image') as File
    const altText = formData.get('altText') as string || ''
    const guideId = formData.get('guideId') as string
    const serviceId = formData.get('serviceId') as string

    if (!file) {
      return {error: 'No image file provided'}
    }

    // Either guideId or serviceId must be provided
    if (!guideId && !serviceId) {
      return {error: 'Either Guide ID or Service ID is required'}
    }

    // Get or create guide if serviceId is provided
    const finalGuideId = guideId || await getOrCreateGuide(serviceId)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {error: 'File must be an image'}
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return {error: `Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`}
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process image with Sharp
    let processedBuffer: Buffer
    let width: number
    let height: number

    try {
      const sharpImage = sharp(buffer)
      const metadata = await sharpImage.metadata()
      
      // Resize if too large while maintaining aspect ratio
      const resizeOptions: { width?: number; height?: number } = {}
      if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
        resizeOptions.width = MAX_IMAGE_WIDTH
      }
      if (metadata.height && metadata.height > MAX_IMAGE_HEIGHT) {
        resizeOptions.height = MAX_IMAGE_HEIGHT
      }

      const processedImage = Object.keys(resizeOptions).length > 0
        ? sharpImage.resize(resizeOptions)
        : sharpImage

      // Convert to WebP for better compression
      processedBuffer = await processedImage
        .webp({ quality: 85 })
        .toBuffer()

      // Get final dimensions
      const finalMetadata = await sharp(processedBuffer).metadata()
      width = finalMetadata.width || 0
      height = finalMetadata.height || 0

    } catch (error) {
      console.error("Error processing image:", error)
      return {error: 'Failed to process image'}
    }

    // Generate hash for deduplication
    const hash = createHash('sha256').update(processedBuffer).digest('hex')

    // Check if image already exists
    const key = `guide-images/${hash}.webp` // Convert all to WebP for consistency
    const cdnUrl = `${GUIDE_IMAGE_CDN_URL}/${key}`

    // Upload to CDN if it doesn't exist
    if (!(await exists(key))) {
      try {
        await putObject(key, processedBuffer, 'image/webp', hash)
      } catch (error) {
        console.error("Error uploading image:", error)
        return {error: 'Failed to upload image'}
      }
    }

    // Save image record to database
    const imageId = crypto.randomUUID()
    
    try {
      await db.insert(guideImage).values({
        id: imageId,
        guideId: finalGuideId,
        originalUrl: null, // This is for uploaded files, not external URLs
        cdnUrl,
        imageHash: hash,
        altText: altText || null,
        width: width || null,
        height: height || null,
        fileSize: buffer.length,
        createdAt: new Date(),
      })
    } catch (error) {
      console.error("Error saving image record:", error)
      return {error: 'Failed to save image record'}
    }

    // Generate markdown
    const markdown = altText 
      ? `![${altText}](${cdnUrl})`
      : `![Image](${cdnUrl})`

    return {
      success: {
        cdnUrl,
        markdown,
        imageId,
      }
    }

  } catch (error) {
    console.error("Error in uploadGuideImage:", error)
    return {error: 'Failed to upload image'}
  }
}

export async function uploadGuideImageFromUrl(originalUrl: string, guideIdOrServiceId: string, altText?: string, isServiceId: boolean = false): Promise<UploadGuideImageResponse> {
  // Auth
  await requireSession()

  try {
    new URL(originalUrl)
  } catch {
    return {error: 'Invalid URL'}
  }

  // Fetch image from URL
  const r = await fetch(originalUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/*',
      'User-Agent': 'Mozilla/5.0 (compatible; GuideImageBot/1.0)', // Some sites require a user agent
    },
    signal: AbortSignal.timeout(10000), // 10 second timeout
  });

  if (!r.ok) {
    return {error: 'Error fetching image from URL'}
  }
  if (!r.headers.get('Content-Type')?.startsWith('image/')) {
    return {error: 'URL does not point to an image'}
  }

  const contentLength = r.headers.get('Content-Length')
  if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
    r.body?.cancel();
    return {
      error: `Image size is greater than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    }
  }

  // Process as uploaded file
  const arrayBuffer = await r.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Create a FormData object to reuse the upload logic
  const formData = new FormData()
  const file = new File([buffer], 'image', { type: r.headers.get('Content-Type') || 'image/jpeg' })
  formData.set('image', file)
  if (isServiceId) {
    formData.set('serviceId', guideIdOrServiceId)
  } else {
    formData.set('guideId', guideIdOrServiceId)
  }
  formData.set('altText', altText || '')

  const result = await uploadGuideImage(formData)
  
  // If successful, update the database record to include the original URL
  if ('success' in result) {
    try {
      await db.update(guideImage)
        .set({ originalUrl })
        .where(eq(guideImage.id, result.success.imageId))
    } catch (error) {
      console.error("Error updating image record with original URL:", error)
      // Don't fail the whole operation for this
    }
  }

  return result
}