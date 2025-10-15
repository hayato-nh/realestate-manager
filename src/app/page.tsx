import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl space-y-8 rounded-lg bg-white p-12 shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            不動産物件管理システム
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            RealEstate Manager - Powered by Next.js & Supabase
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-blue-900">
              🔐 認証テスト
            </h2>
            <p className="mb-4 text-sm text-gray-700">
              Supabaseとの接続と認証機能をテストします。
            </p>
            <Link
              href="/login"
              className="inline-flex rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ログインページへ
            </Link>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-purple-900">
              📊 接続テストページ
            </h2>
            <p className="mb-4 text-sm text-gray-700">
              データベース接続、認証、プロフィール取得をテストします。
              <br />
              <span className="font-semibold">※ログインが必要です</span>
            </p>
            <Link
              href="/test"
              className="inline-flex rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              テストページへ
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">📝 セットアップ手順</h3>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
            <li>.env.local にSupabaseの認証情報を設定</li>
            <li>Supabase SQL Editorでマイグレーションを実行</li>
            <li>Supabase Authenticationでユーザーを作成</li>
            <li>上記のログインボタンからテスト</li>
          </ol>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>詳細は docs/DATABASE_SETUP.md をご確認ください</p>
        </div>
      </div>
    </div>
  )
}
