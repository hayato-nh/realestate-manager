'use client'

import PropertyCard from './property-card'
import Pagination from '../ui/pagination'
import { useRouter, useSearchParams } from 'next/navigation'

interface Property {
  id: string
  name: string
  prefecture: string
  city: string
  address_line: string
  property_type: string
  transaction_type: string
  price: number
  area_sqm: number
  layout: string
  building_age: number | null
  hn_pi_property_images?: Array<{
    id: string
    image_url: string
    is_main: boolean
    display_order: number
  }>
}

interface PropertyListProps {
  properties: Property[]
  currentPage: number
  totalPages: number
  sortBy: string
}

export default function PropertyList({
  properties,
  currentPage,
  totalPages,
  sortBy,
}: PropertyListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    params.set('page', '1') // Reset to first page on sort change
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {properties.length}件の物件を表示中
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">
            並び替え:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">新着順</option>
            <option value="price_asc">価格が安い順</option>
            <option value="price_desc">価格が高い順</option>
            <option value="area_asc">面積が小さい順</option>
            <option value="area_desc">面積が大きい順</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  )
}
