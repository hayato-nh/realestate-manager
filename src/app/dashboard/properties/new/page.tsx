'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/components/logout-button'

const PREFECTURE_LIST = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
]

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    prefecture: '',
    city: '',
    address_line: '',
    property_type: 'mansion' as 'mansion' | 'house' | 'land' | 'shop' | 'office',
    transaction_type: 'sale' as 'sale' | 'rent',
    price: '',
    area_sqm: '',
    layout: '',
    building_age: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Validate required fields
      if (!formData.name || !formData.prefecture || !formData.price) {
        throw new Error('必須項目を入力してください')
      }

      // Insert property
      const { data: property, error: insertError } = await supabase
        .from('hn_pi_properties')
        .insert({
          name: formData.name,
          prefecture: formData.prefecture,
          city: formData.city || null,
          address_line: formData.address_line || null,
          property_type: formData.property_type,
          transaction_type: formData.transaction_type,
          price: parseInt(formData.price),
          area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
          layout: formData.layout || null,
          building_age: formData.building_age ? parseInt(formData.building_age) : null,
          description: formData.description || null,
          status: formData.status,
          created_by: user.id,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      // Redirect to property detail or dashboard
      router.push(`/dashboard`)
      router.refresh()
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
          <h1 className="text-lg font-semibold text-gray-900">物件登録</h1>
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
        <div className="mx-auto max-w-3xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">物件情報を入力</h2>

            {/* Basic Info */}
            <div className="mb-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>

              {/* Property Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  物件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="例: HF 西巣鴨レジデンス"
                />
              </div>

              {/* Property Type */}
              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
                  物件種別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="mansion">マンション</option>
                  <option value="house">一戸建て</option>
                  <option value="land">土地</option>
                  <option value="shop">店舗</option>
                  <option value="office">事務所</option>
                </select>
              </div>

              {/* Transaction Type */}
              <div>
                <label
                  htmlFor="transaction_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  取引種別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="transaction_type"
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="sale">売買</option>
                  <option value="rent">賃貸</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  価格（円） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="例: 50000000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  円単位で入力してください（例: 5000万円 → 50000000）
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">所在地</h3>

              {/* Prefecture */}
              <div>
                <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700">
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <select
                  id="prefecture"
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {PREFECTURE_LIST.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  市区町村
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="例: 北区"
                />
              </div>

              {/* Address Line */}
              <div>
                <label htmlFor="address_line" className="block text-sm font-medium text-gray-700">
                  町名・番地
                </label>
                <input
                  type="text"
                  id="address_line"
                  name="address_line"
                  value={formData.address_line}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="例: 滝野川１－１－１"
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">物件詳細</h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Area */}
                <div>
                  <label htmlFor="area_sqm" className="block text-sm font-medium text-gray-700">
                    面積（㎡）
                  </label>
                  <input
                    type="number"
                    id="area_sqm"
                    name="area_sqm"
                    value={formData.area_sqm}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="例: 100"
                  />
                </div>

                {/* Layout */}
                <div>
                  <label htmlFor="layout" className="block text-sm font-medium text-gray-700">
                    間取り
                  </label>
                  <input
                    type="text"
                    id="layout"
                    name="layout"
                    value={formData.layout}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="例: 2LDK"
                  />
                </div>

                {/* Building Age */}
                <div>
                  <label htmlFor="building_age" className="block text-sm font-medium text-gray-700">
                    築年数
                  </label>
                  <input
                    type="number"
                    id="building_age"
                    name="building_age"
                    value={formData.building_age}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="例: 5"
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    ステータス
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  物件説明
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="物件の特徴や周辺環境などを入力してください"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard"
                className="rounded-md border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <Save className="h-5 w-5" />
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
