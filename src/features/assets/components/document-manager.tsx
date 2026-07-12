'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, X, File, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentManagerProps {
  assetId: string
}

export function DocumentManager({ assetId }: DocumentManagerProps) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    // In a real application, upload files to Supabase Storage bucket 'asset_documents'
    alert(`Uploading ${files.length} files to Supabase storage...`)
    setFiles([])
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />
    if (type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />
    return <File className="w-8 h-8 text-zinc-500" />
  }

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-full shadow-sm mb-4 border border-zinc-100 dark:border-zinc-800">
          <UploadCloud className="w-6 h-6 text-indigo-500" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Drag & drop files here</h3>
        <p className="text-xs text-zinc-500 mt-1">or click to browse from your computer</p>
        <p className="text-xs text-zinc-400 mt-4">Supports PDF, JPG, PNG, DOCX (Max 20MB)</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Files to upload</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleUpload} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Upload {files.length} Files
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
