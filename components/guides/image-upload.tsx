"use client"

import {useState, useRef} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent} from "@/components/ui/card"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Image, Upload, Link as LinkIcon, X, Loader2} from "lucide-react"
import {uploadGuideImage, uploadGuideImageFromUrl} from "@/app/actions/guide-images"
import {toast} from "sonner"

interface ImageUploadProps {
  onImageInsert: (markdown: string) => void
  serviceId: string
}

export default function ImageUpload({ onImageInsert, serviceId }: ImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file")
  const [imageUrl, setImageUrl] = useState("")
  const [altText, setAltText] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first")
      return
    }

    if (!serviceId) {
      toast.error("Service ID is required")
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.set('image', selectedFile)
      formData.set('altText', altText)
      formData.set('serviceId', serviceId)

      const result = await uploadGuideImage(formData)
      
      if ('success' in result) {
        onImageInsert(result.success.markdown)
        toast.success("Image uploaded successfully")
        resetForm()
        setIsOpen(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL")
      return
    }

    if (!serviceId) {
      toast.error("Service ID is required")
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadGuideImageFromUrl(imageUrl, serviceId, altText, true)
      
      if ('success' in result) {
        onImageInsert(result.success.markdown)
        toast.success("Image uploaded successfully")
        resetForm()
        setIsOpen(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setImageUrl("")
    setAltText("")
    setSelectedFile(null)
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setUploadMode("file")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image to Guide</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMode === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMode("file")}
            >
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMode === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMode("url")}
            >
              From URL
            </Button>
          </div>

          {uploadMode === "file" && (
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="altText">Alt Text (for accessibility)</Label>
              <Input
                id="altText"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe what the image shows..."
              />
            </div>

            {preview && (
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={preview} 
                      alt="Preview of selected image"
                      className="max-w-full h-auto max-h-48 mx-auto rounded"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removePreview}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop an image here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Browse Files
              </Button>
            </div>

            {preview && (
              <Button 
                onClick={handleFileUpload}
                disabled={isUploading || !selectedFile}
                className="w-full"
                type="button"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Image"
                )}
              </Button>
            )}
            </div>
          )}

          {uploadMode === "url" && (
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altTextUrl">Alt Text (for accessibility)</Label>
              <Input
                id="altTextUrl"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe what the image shows..."
              />
            </div>

            <Button 
              onClick={handleUrlUpload}
              disabled={!imageUrl.trim() || isUploading}
              className="w-full"
              type="button"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Upload from URL
                </>
              )}
            </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}