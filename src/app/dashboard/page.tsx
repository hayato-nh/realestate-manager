import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileUp, BarChart3, Building2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get statistics
  const { count: totalCount } = await supabase
    .from('hn_pi_properties')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: publishedCount } = await supabase
    .from('hn_pi_properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('deleted_at', null)

  const { count: draftCount } = await supabase
    .from('hn_pi_properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')
    .is('deleted_at', null)

  const { count: myCount } = await supabase
    .from('hn_pi_properties')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)
    .is('deleted_at', null)

  // Get recent properties
  const { data: recentProperties } = await supabase
    .from('hn_pi_properties')
    .select(
      `
      id,
      name,
      prefecture,
      city,
      property_type,
      transaction_type,
      price,
      status,
      created_at
    `
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  const propertyTypeLabel = {
    mansion: 'マンション',
    house: '一戸建て',
    land: '土地',
    shop: '店舗',
    office: '事務所',
  }

  const transactionTypeLabel = {
    sale: '売買',
    rent: '賃貸',
  }

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
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              物件一覧
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-600"
            >
              ダッシュボード
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">物件管理の概要と最近のアクティビティ</p>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総物件数</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalCount || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">公開中</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {publishedCount || 0}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">下書き</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {draftCount || 0}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">自分の物件</p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {myCount || 0}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/properties/import"
              className="flex items-center gap-4 rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="rounded-full bg-blue-100 p-3">
                <FileUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">PDFインポート</h3>
                <p className="text-sm text-gray-600">
                  PDFから物件情報を取り込む
                </p>
              </div>
            </Link>

            <Link
              href="/properties"
              className="flex items-center gap-4 rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="rounded-full bg-purple-100 p-3">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">物件一覧</h3>
                <p className="text-sm text-gray-600">公開物件を確認する</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Properties */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            最近の物件
          </h2>
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      物件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      場所
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      作成日
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentProperties?.map((property) => (
                    <tr
                      key={property.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/properties/${property.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {property.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                          {
                            propertyTypeLabel[
                              property.property_type as keyof typeof propertyTypeLabel
                            ]
                          }
                        </span>
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {
                            transactionTypeLabel[
                              property.transaction_type as keyof typeof transactionTypeLabel
                            ]
                          }
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {property.price.toLocaleString('ja-JP')}円
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {property.prefecture} {property.city}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            property.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {property.status === 'published' ? '公開中' : '下書き'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {new Date(property.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                  {(!recentProperties || recentProperties.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        物件がまだ登録されていません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
