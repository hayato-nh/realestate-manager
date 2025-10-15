'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Home, Maximize, Heart } from 'lucide-react'

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

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Get main image or first image
  const mainImage = property.hn_pi_property_images?.find((img) => img.is_main)
  const imageUrl =
    mainImage?.image_url ||
    property.hn_pi_property_images?.[0]?.image_url ||
    'https://placehold.co/600x400/e5e7eb/6b7280?text=No+Image'

  const propertyTypeLabel = {
    mansion: 'マンション',
    house: '一戸建て',
    land: '土地',
    shop: '店舗',
    office: '事務所',
  }[property.property_type]

  const transactionTypeLabel = {
    sale: '売買',
    rent: '賃貸',
  }[property.transaction_type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link href={`/properties/${property.id}`}>
        <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-gray-200">
            <img
              src={imageUrl}
              alt={property.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badge */}
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                {propertyTypeLabel}
              </span>
            </div>

            {/* Favorite Button */}
            <button
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Add favorite functionality
              }}
            >
              <Heart className="h-5 w-5 text-gray-600" />
            </button>

            {/* Transaction Type */}
            <div className="absolute bottom-3 right-3">
              <span className="rounded bg-white/90 px-2 py-1 text-xs font-semibold text-gray-900 backdrop-blur-sm">
                {transactionTypeLabel}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {property.name}
            </h3>

            {/* Location */}
            <div className="mb-3 flex items-start text-sm text-gray-600">
              <MapPin className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {property.prefecture} {property.city} {property.address_line}
              </span>
            </div>

            {/* Details */}
            <div className="mb-3 flex flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <Home className="mr-1 h-4 w-4" />
                <span>{property.layout}</span>
              </div>
              <div className="flex items-center">
                <Maximize className="mr-1 h-4 w-4" />
                <span>{property.area_sqm}㎡</span>
              </div>
              {property.building_age !== null && (
                <div className="flex items-center">
                  <span>築{property.building_age}年</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mt-4 border-t pt-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500">
                    {transactionTypeLabel === '売買' ? '価格' : '家賃'}
                  </span>
                  <p className="text-2xl font-bold text-gray-900">
                    {property.price.toLocaleString('ja-JP')}
                    <span className="ml-1 text-base font-normal text-gray-600">円</span>
                    {transactionTypeLabel === '賃貸' && (
                      <span className="ml-1 text-sm font-normal text-gray-500">/月</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
