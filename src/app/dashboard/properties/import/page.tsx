'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import PdfUploader from '@/components/import/pdf-uploader'
import PropertyMapper, { PropertyFormData } from '@/components/import/property-mapper'
import { extractPropertyData, ExtractedPropertyData } from '@/lib/pdf-parser'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/components/logout-button'

type Step = 'upload' | 'mapping' | 'success'

export default function ImportPage() {
  const supabase = createClient()

  const [step, setStep] = useState<Step>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedPropertyData | null>(null)
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // Upload PDF to API
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('PDFの解析に失敗しました')
      }

      const data = await response.json()

      // Extract property data from text
      const extracted = extractPropertyData(data.text)
      setExtractedData(extracted)
      setStep('mapping')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProperty = async (formData: PropertyFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('ログインが必要です')
      }

      // Insert property
      const { data: property, error: insertError } = await supabase
        .from('hn_pi_properties')
        .insert({
          name: formData.name,
          prefecture: formData.prefecture,
          city: formData.city,
          address_line: formData.address_line,
          property_type: formData.property_type,
          transaction_type: formData.transaction_type,
          price: formData.price,
          area_sqm: formData.area_sqm,
          layout: formData.layout,
          building_age: formData.building_age,
          description: formData.description,
          status: formData.status,
          created_by: user.id,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      setSavedPropertyId(property.id)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            RealEstate Manager
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">PDFインポート</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/properties"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              物件一覧
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              ダッシュボード
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                step === 'upload' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step === 'upload'
                    ? 'bg-blue-600 text-white'
                    : step === 'mapping' || step === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <span className="font-medium">PDFアップロード</span>
            </div>

            <div className="h-0.5 w-16 bg-gray-300"></div>

            <div
              className={`flex items-center gap-2 ${
                step === 'mapping' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step === 'mapping'
                    ? 'bg-blue-600 text-white'
                    : step === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <span className="font-medium">データマッピング</span>
            </div>

            <div className="h-0.5 w-16 bg-gray-300"></div>

            <div
              className={`flex items-center gap-2 ${
                step === 'success' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  step === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
              <span className="font-medium">完了</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step Content */}
          {step === 'upload' && (
            <div className="rounded-lg bg-white p-8 shadow-md">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 inline-flex rounded-full bg-blue-100 p-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  物件情報のPDFをアップロード
                </h2>
                <p className="mt-2 text-gray-600">
                  物件情報が記載されたPDFファイルをアップロードしてください。
                  <br />
                  自動的に情報を抽出して入力フォームに反映します。
                </p>
              </div>

              <PdfUploader onUpload={handleFileUpload} isLoading={isLoading} />

              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  PDFの書式について
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>• 物件名、住所、価格、面積などの情報を含むPDFに対応</li>
                  <li>• 自動抽出された情報は次のステップで確認・編集できます</li>
                  <li>• 一定の書式に従ったPDFで最適な結果が得られます</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'mapping' && extractedData && (
            <div>
              <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  データの確認と編集
                </h2>
                <p className="text-gray-600">
                  PDFから抽出された情報を確認し、必要に応じて修正してください。
                </p>
              </div>

              <PropertyMapper
                extractedData={extractedData}
                onSave={handleSaveProperty}
                isLoading={isLoading}
              />
            </div>
          )}

          {step === 'success' && savedPropertyId && (
            <div className="rounded-lg bg-white p-12 text-center shadow-md">
              <div className="mx-auto mb-6 inline-flex rounded-full bg-green-100 p-6">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                物件を保存しました
              </h2>
              <p className="mb-8 text-gray-600">
                PDFから物件情報のインポートが完了しました。
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setStep('upload')
                    setExtractedData(null)
                    setSavedPropertyId(null)
                  }}
                  className="rounded-md border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  さらにインポート
                </button>
                <Link
                  href={`/properties/${savedPropertyId}`}
                  className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  物件を表示
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  ダッシュボードへ
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
