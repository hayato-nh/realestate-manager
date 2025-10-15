import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Home, Maximize, Calendar, Building2 } from 'lucide-react'

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get property with images
  const { data: property, error } = await supabase
    .from('hn_pi_properties')
    .select(
      `
      *,
      hn_pi_property_images (
        id,
        image_url,
        is_main,
        display_order
      )
    `
    )
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !property) {
    notFound()
  }

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

  // Get main image or first image
  const mainImage = property.hn_pi_property_images?.find((img) => img.is_main)
  const imageUrl =
    mainImage?.image_url ||
    property.hn_pi_property_images?.[0]?.image_url ||
    'https://placehold.co/1200x600/e5e7eb/6b7280?text=No+Image'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            RealEstate Manager
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/properties"
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              物件一覧に戻る
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Property Image */}
          <div className="mb-8 overflow-hidden rounded-lg shadow-lg">
            <img
              src={imageUrl}
              alt={property.name}
              className="h-96 w-full object-cover"
            />
          </div>

          {/* Property Info */}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-md">
            {/* Title and Type */}
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                  {propertyTypeLabel}
                </span>
                <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
                  {transactionTypeLabel}
                </span>
                {property.status === 'published' ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    公開中
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                    下書き
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
            </div>

            {/* Price */}
            <div className="mb-6 border-b border-t py-6">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-600">
                  {transactionTypeLabel === '売買' ? '価格' : '家賃'}
                </span>
                <p className="text-4xl font-bold text-gray-900">
                  {property.price.toLocaleString('ja-JP')}
                  <span className="ml-2 text-xl font-normal text-gray-600">円</span>
                  {transactionTypeLabel === '賃貸' && (
                    <span className="ml-1 text-lg font-normal text-gray-500">/月</span>
                  )}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <MapPin className="h-5 w-5" />
                所在地
              </h2>
              <p className="text-lg text-gray-700">
                {property.prefecture}
                {property.city && ` ${property.city}`}
                {property.address_line && ` ${property.address_line}`}
              </p>
            </div>

            {/* Property Details */}
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">物件詳細</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {property.area_sqm && (
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Maximize className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">面積</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {property.area_sqm}㎡
                      </p>
                    </div>
                  </div>
                )}

                {property.layout && (
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <Home className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">間取り</p>
                      <p className="text-lg font-semibold text-gray-900">{property.layout}</p>
                    </div>
                  </div>
                )}

                {property.building_age !== null && (
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">築年数</p>
                      <p className="text-lg font-semibold text-gray-900">
                        築{property.building_age}年
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Building2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">物件種別</p>
                    <p className="text-lg font-semibold text-gray-900">{propertyTypeLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-6">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">物件説明</h2>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap text-gray-700">{property.description}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">物件ID:</span> {property.id}
                </div>
                <div>
                  <span className="font-medium">登録日:</span>{' '}
                  {new Date(property.created_at).toLocaleDateString('ja-JP')}
                </div>
                {property.updated_at !== property.created_at && (
                  <div>
                    <span className="font-medium">更新日:</span>{' '}
                    {new Date(property.updated_at).toLocaleDateString('ja-JP')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="rounded-lg bg-blue-50 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">この物件に興味がありますか？</h2>
            <p className="mb-6 text-gray-600">
              詳細情報やご見学をご希望の方は、お気軽にお問い合わせください。
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/properties"
                className="rounded-md border-2 border-blue-600 bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
              >
                他の物件を見る
              </Link>
              <button className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                お問い合わせ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
