'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface PropertyFiltersProps {
  searchParams: {
    q?: string
    prefecture?: string
    city?: string
    property_type?: string
    transaction_type?: string
    min_price?: string
    max_price?: string
    layout?: string
  }
}

export default function PropertyFilters({ searchParams }: PropertyFiltersProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.q || '')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to first page
    router.push(`/properties?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/properties')
    setKeyword('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('q', keyword)
  }

  const hasActiveFilters =
    searchParams.q ||
    searchParams.prefecture ||
    searchParams.city ||
    searchParams.property_type ||
    searchParams.transaction_type ||
    searchParams.min_price ||
    searchParams.max_price ||
    searchParams.layout

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">検索条件</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <X className="h-4 w-4" />
            クリア
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <label htmlFor="keyword" className="mb-2 block text-sm font-medium text-gray-700">
          キーワード
        </label>
        <div className="relative">
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="物件名や説明で検索"
            className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Transaction Type */}
      <div className="mb-6">
        <label htmlFor="transaction_type" className="mb-2 block text-sm font-medium text-gray-700">
          取引種別
        </label>
        <select
          id="transaction_type"
          value={searchParams.transaction_type || ''}
          onChange={(e) => updateFilter('transaction_type', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">すべて</option>
          <option value="sale">売買</option>
          <option value="rent">賃貸</option>
        </select>
      </div>

      {/* Property Type */}
      <div className="mb-6">
        <label htmlFor="property_type" className="mb-2 block text-sm font-medium text-gray-700">
          物件種別
        </label>
        <select
          id="property_type"
          value={searchParams.property_type || ''}
          onChange={(e) => updateFilter('property_type', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">すべて</option>
          <option value="mansion">マンション</option>
          <option value="house">一戸建て</option>
          <option value="land">土地</option>
          <option value="shop">店舗</option>
          <option value="office">事務所</option>
        </select>
      </div>

      {/* Prefecture */}
      <div className="mb-6">
        <label htmlFor="prefecture" className="mb-2 block text-sm font-medium text-gray-700">
          都道府県
        </label>
        <select
          id="prefecture"
          value={searchParams.prefecture || ''}
          onChange={(e) => updateFilter('prefecture', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">すべて</option>
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

      {/* City */}
      {searchParams.prefecture && (
        <div className="mb-6">
          <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">
            市区町村
          </label>
          <input
            type="text"
            id="city"
            value={searchParams.city || ''}
            onChange={(e) => updateFilter('city', e.target.value)}
            placeholder="例: 渋谷区"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Layout */}
      <div className="mb-6">
        <label htmlFor="layout" className="mb-2 block text-sm font-medium text-gray-700">
          間取り
        </label>
        <select
          id="layout"
          value={searchParams.layout || ''}
          onChange={(e) => updateFilter('layout', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">すべて</option>
          <option value="1R">1R</option>
          <option value="1K">1K</option>
          <option value="1DK">1DK</option>
          <option value="1LDK">1LDK</option>
          <option value="2K">2K</option>
          <option value="2DK">2DK</option>
          <option value="2LDK">2LDK</option>
          <option value="3LDK">3LDK</option>
          <option value="4LDK">4LDK</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">価格帯</label>
        <div className="space-y-2">
          <input
            type="number"
            value={searchParams.min_price || ''}
            onChange={(e) => updateFilter('min_price', e.target.value)}
            placeholder="最低価格"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            value={searchParams.max_price || ''}
            onChange={(e) => updateFilter('max_price', e.target.value)}
            placeholder="最高価格"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">単位: 円</p>
      </div>
    </div>
  )
}
