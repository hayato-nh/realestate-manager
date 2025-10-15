'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X } from 'lucide-react'

interface PdfUploaderProps {
  onUpload: (file: File) => void
  isLoading?: boolean
}

export default function PdfUploader({ onUpload, isLoading = false }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const pdfFile = files.find((file) => file.type === 'application/pdf')

      if (pdfFile) {
        setSelectedFile(pdfFile)
        onUpload(pdfFile)
      }
    },
    [onUpload]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type === 'application/pdf') {
        setSelectedFile(file)
        onUpload(file)
      }
    },
    [onUpload]
  )

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
  }, [])

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isLoading}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            id="pdf-upload"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`rounded-full p-4 ${
                isDragging ? 'bg-blue-100' : 'bg-gray-200'
              }`}
            >
              <Upload
                className={`h-8 w-8 ${
                  isDragging ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-900">
                PDFファイルをドラッグ&ドロップ
              </p>
              <p className="mt-1 text-sm text-gray-600">
                または
                <label
                  htmlFor="pdf-upload"
                  className="ml-1 cursor-pointer font-semibold text-blue-600 hover:text-blue-700"
                >
                  ファイルを選択
                </label>
              </p>
            </div>

            <p className="text-xs text-gray-500">
              対応形式: PDF（最大 10MB）
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-lg border border-gray-300 bg-white p-4">
          <div className="rounded-full bg-blue-100 p-3">
            <File className="h-6 w-6 text-blue-600" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-600">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>

          {!isLoading && (
            <button
              onClick={handleRemove}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              解析中...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
