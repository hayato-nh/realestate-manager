import { createClient } from '@/lib/supabase/server'
import PropertyList from '@/components/properties/property-list'
import PropertyFilters from '@/components/properties/property-filters'
import Link from 'next/link'

interface SearchParams {
  page?: string
  q?: string
  prefecture?: string
  city?: string
  property_type?: string
  transaction_type?: string
  min_price?: string
  max_price?: string
  layout?: string
  sort?: string
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const page = parseInt(searchParams.page || '1')
  const pageSize = 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build query
  let query = supabase
    .from('hn_pi_properties')
    .select(`
      *,
      hn_pi_property_images (
        id,
        image_url,
        is_main,
        display_order
      )
    `, { count: 'exact' })
    .eq('status', 'published')
    .is('deleted_at', null)

  // Apply filters
  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  if (searchParams.prefecture) {
    query = query.eq('prefecture', searchParams.prefecture)
  }

  if (searchParams.city) {
    query = query.eq('city', searchParams.city)
  }

  if (searchParams.property_type) {
    query = query.eq('property_type', searchParams.property_type)
  }

  if (searchParams.transaction_type) {
    query = query.eq('transaction_type', searchParams.transaction_type)
  }

  if (searchParams.min_price) {
    query = query.gte('price', parseInt(searchParams.min_price))
  }

  if (searchParams.max_price) {
    query = query.lte('price', parseInt(searchParams.max_price))
  }

  if (searchParams.layout) {
    query = query.eq('layout', searchParams.layout)
  }

  // Apply sorting
  const sortBy = searchParams.sort || 'newest'
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'area_asc':
      query = query.order('area_sqm', { ascending: true })
      break
    case 'area_desc':
      query = query.order('area_sqm', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  query = query.range(from, to)

  const { data: properties, error, count } = await query

  const totalPages = count ? Math.ceil(count / pageSize) : 0

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
              className="text-sm font-medium text-blue-600"
            >
              物件一覧
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              ダッシュボード
            </Link>
            <Link
              href="/dashboard/properties/import"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              PDFインポート
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">物件を探す</h1>
          <p className="mt-2 text-gray-600">
            {count ? `${count.toLocaleString()}件の物件` : '物件を読み込み中...'}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <PropertyFilters searchParams={searchParams} />
          </aside>

          {/* Properties Grid */}
          <div className="flex-1">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-red-800">エラーが発生しました</p>
                <p className="mt-2 text-sm text-red-600">{error.message}</p>
              </div>
            ) : !properties || properties.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  条件に合う物件が見つかりませんでした
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  検索条件を変更してお試しください
                </p>
              </div>
            ) : (
              <>
                <PropertyList
                  properties={properties}
                  currentPage={page}
                  totalPages={totalPages}
                  sortBy={sortBy}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2025 RealEstate Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
