'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { ExtractedPropertyData } from '@/lib/pdf-parser'

interface PropertyMapperProps {
  extractedData: ExtractedPropertyData
  onSave: (data: PropertyFormData) => void
  isLoading?: boolean
}

export interface PropertyFormData {
  name: string
  prefecture: string
  city: string
  address_line: string
  property_type: 'mansion' | 'house' | 'land' | 'shop' | 'office'
  transaction_type: 'sale' | 'rent'
  price: number
  area_sqm: number
  layout: string
  building_age: number | null
  description: string
  status: 'draft' | 'published'
}

export default function PropertyMapper({
  extractedData,
  onSave,
  isLoading = false,
}: PropertyMapperProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: extractedData.name || '',
    prefecture: extractedData.prefecture || '',
    city: extractedData.city || '',
    address_line: extractedData.address_line || '',
    property_type: extractedData.property_type || 'mansion',
    transaction_type: extractedData.transaction_type || 'sale',
    price: extractedData.price || 0,
    area_sqm: extractedData.area_sqm || 0,
    layout: extractedData.layout || '',
    building_age: extractedData.building_age || null,
    description: extractedData.description || '',
    status: 'draft',
  })

  const [showRawText, setShowRawText] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'area_sqm' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    onSave({ ...formData, status })
  }

  const getMissingFields = () => {
    const missing: string[] = []
    if (!formData.name) missing.push('物件名')
    if (!formData.prefecture) missing.push('都道府県')
    if (!formData.property_type) missing.push('物件種別')
    if (!formData.transaction_type) missing.push('取引種別')
    if (!formData.price) missing.push('価格')
    return missing
  }

  const missingFields = getMissingFields()
  const canPublish = missingFields.length === 0

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div className="rounded-lg border bg-white p-4">
        {canPublish ? (
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">データの抽出が完了しました</p>
              <p className="text-sm text-green-700">
                必須項目がすべて入力されています。内容を確認して保存してください。
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">
                以下の項目を入力してください
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-amber-700">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Raw Text Toggle */}
      <button
        onClick={() => setShowRawText(!showRawText)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
      >
        <Info className="h-4 w-4" />
        {showRawText ? '元のテキストを非表示' : '元のテキストを表示'}
      </button>

      {showRawText && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            抽出された元のテキスト:
          </p>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs text-gray-600">
            {extractedData.rawText}
          </pre>
        </div>
      )}

      {/* Form */}
      <form className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">基本情報</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                物件名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="property_type"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  物件種別 <span className="text-red-600">*</span>
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="mansion">マンション</option>
                  <option value="house">一戸建て</option>
                  <option value="land">土地</option>
                  <option value="shop">店舗</option>
                  <option value="office">事務所</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="transaction_type"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  取引種別 <span className="text-red-600">*</span>
                </label>
                <select
                  id="transaction_type"
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="sale">売買</option>
                  <option value="rent">賃貸</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">所在地</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="prefecture"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  都道府県 <span className="text-red-600">*</span>
                </label>
                <select
                  id="prefecture"
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="東京都">東京都</option>
                  <option value="神奈川県">神奈川県</option>
                  <option value="千葉県">千葉県</option>
                  <option value="埼玉県">埼玉県</option>
                  <option value="大阪府">大阪府</option>
                  <option value="京都府">京都府</option>
                  <option value="兵庫県">兵庫県</option>
                  <option value="愛知県">愛知県</option>
                  <option value="福岡県">福岡県</option>
                  <option value="北海道">北海道</option>
                </select>
              </div>

              <div>
                <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
                  市区町村
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address_line"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                町名・番地
              </label>
              <input
                type="text"
                id="address_line"
                name="address_line"
                value={formData.address_line}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">物件詳細</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="mb-1 block text-sm font-medium text-gray-700">
                  価格（円） <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="area_sqm"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  面積（㎡）
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="area_sqm"
                  name="area_sqm"
                  value={formData.area_sqm}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="layout" className="mb-1 block text-sm font-medium text-gray-700">
                  間取り
                </label>
                <input
                  type="text"
                  id="layout"
                  name="layout"
                  value={formData.layout}
                  onChange={handleChange}
                  placeholder="例: 2LDK"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="building_age"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                築年数
              </label>
              <input
                type="number"
                id="building_age"
                name="building_age"
                value={formData.building_age || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                説明
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isLoading}
            className="flex-1 rounded-md border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            下書きとして保存
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={isLoading || !canPublish}
            className="flex-1 rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            公開して保存
          </button>
        </div>
      </form>
    </div>
  )
}
