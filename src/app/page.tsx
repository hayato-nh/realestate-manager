import Link from 'next/link'
import { Building2, Search, FileUp, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/logout-button'

export default async function Home() {
  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">RealEstate Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/properties"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              物件一覧
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  ダッシュボード
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-5xl font-bold text-gray-900">
            不動産物件管理システム
          </h2>
          <p className="mb-12 text-xl text-gray-600">
            PDFから簡単インポート、効率的な物件管理、直感的な操作性
          </p>

          {/* CTA Buttons */}
          <div className="mb-16 flex justify-center gap-4">
            <Link
              href="/properties"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
            >
              <Search className="h-5 w-5" />
              物件を探す
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50"
              >
                <BarChart3 className="h-5 w-5" />
                ダッシュボード
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50"
              >
                <BarChart3 className="h-5 w-5" />
                ログイン
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-blue-100 p-4">
                <FileUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                PDFインポート
              </h3>
              <p className="text-gray-600">
                物件情報PDFを自動解析して、データを簡単に登録できます。
              </p>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-green-100 p-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                高度な検索
              </h3>
              <p className="text-gray-600">
                都道府県、市区町村、価格帯など、多様な条件で物件を検索。
              </p>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-purple-100 p-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                管理ダッシュボード
              </h3>
              <p className="text-gray-600">
                物件の統計情報や最近の活動を一目で確認できます。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>Powered by Next.js 15 & Supabase</p>
        </div>
      </footer>
    </div>
  )
}
