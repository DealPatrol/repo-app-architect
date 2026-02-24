'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, File, Loader2 } from 'lucide-react'

interface FileUploaderProps {
  projectId: string
  taskId: string
  userId: string
  onFileUploaded?: (file: any) => void
}

export function FileUploader({
  projectId,
  taskId,
  userId,
  onFileUploaded,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) {
    if (!files) return

    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)

    try {
      // First upload to Vercel Blob
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      const { url, filename, size, type } = await uploadRes.json()

      // Then save attachment metadata to database
      const attachmentRes = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}/attachments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_url: url,
            file_name: filename,
            file_size: size,
            mime_type: type,
            uploaded_by: userId,
          }),
        }
      )

      if (!attachmentRes.ok) throw new Error('Failed to save attachment')

      const attachment = await attachmentRes.json()
      setUploadedFiles((prev) => [...prev, attachment])
      onFileUploaded?.(attachment)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteFile = async (attachmentId: string, fileUrl: string) => {
    try {
      await fetch(
        `/api/projects/${projectId}/tasks/${taskId}/attachments`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attachment_id: attachmentId }),
        }
      )

      setUploadedFiles((prev) => prev.filter((f) => f.id !== attachmentId))
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </>
          )}
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attachments</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {file.file_name}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteFile(file.id, file.file_url)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
