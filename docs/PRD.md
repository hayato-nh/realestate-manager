# 製品要求仕様書（PRD）: 不動産物件管理システム

**プロジェクト名**: RealEstate Manager
**バージョン**: 1.0.0
**最終更新日**: 2025-10-15
**ステータス**: Draft

---

## 目次

1. [概要](#概要)
2. [目標とビジョン](#目標とビジョン)
3. [技術スタック](#技術スタック)
4. [機能要件](#機能要件)
5. [定性的要件](#定性的要件)
6. [データモデル](#データモデル)
7. [実装ガイド](#実装ガイド)
8. [マイルストーン](#マイルストーン)

---

## 概要

本システムは、不動産物件情報を効率的に管理するためのWebアプリケーションです。物件の登録、編集、削除、検索機能を提供し、PDFからの自動データ抽出にも対応します。ユーザー認証とロールベースのアクセス制御により、セキュアな運用を実現します。

### ターゲットユーザー
- **不動産管理者**: 物件情報の登録・更新・削除を行う
- **不動産営業担当**: 物件情報を閲覧し、顧客に提案する
- **一般ユーザー**: 公開物件を閲覧する（将来拡張）

---

## 目標とビジョン

### ビジネス目標
1. 物件情報の一元管理により業務効率を30%向上
2. PDFインポート機能により手入力作業を50%削減
3. 直感的なUIにより、新規ユーザーのオンボーディング時間を10分以内に短縮

### 技術目標
1. モダンなWeb技術スタックの活用
2. スケーラブルで保守性の高いアーキテクチャ
3. 高速なページロード（1秒以内）とスムーズなUX

---

## 技術スタック

### フロントエンド
- **Next.js 15.5.5** (App Router)
  - React Server Components活用
  - Turbopack による高速ビルド
- **React 19.1.0**
- **TypeScript 5.x**
- **Tailwind CSS 4.x**
  - レスポンシブデザイン
  - カスタムテーマ対応
- **Framer Motion**
  - ページ遷移アニメーション
  - インタラクティブなUI要素

### バックエンド・インフラ
- **Supabase**
  - PostgreSQL データベース
  - Authentication（JWT）
  - Row Level Security (RLS)
  - Storage（画像・PDF保存）
  - Realtime subscriptions

### その他のツール
- **react-pdf** または **pdf-parse**: PDFデータ抽出
- **@react-google-maps/api** または **Mapbox GL JS**: 地図表示
- **Zod**: スキーマバリデーション
- **React Hook Form**: フォーム管理
- **SWR** または **React Query**: データフェッチング・キャッシング

---

## 機能要件

### 1. 認証・認可機能

#### 1.1 ユーザー認証
- **ログイン**: メールアドレス・パスワード
- **ログアウト**: セッション終了
- **パスワードリセット**: メール経由
- **セッション管理**: JWT トークン、有効期限7日間

#### 1.2 ロールベースアクセス制御（RBAC）
| ロール | 権限 |
|--------|------|
| **管理者（Admin）** | 全物件の作成・編集・削除、ユーザー管理、システム設定 |
| **編集者（Editor）** | 物件の作成・編集、自分が作成した物件の削除 |
| **閲覧者（Viewer）** | 物件情報の閲覧のみ |

### 2. 物件管理機能

#### 2.1 物件登録
**必須項目**:
- 物件名（最大100文字）
- 物件種別（マンション/一戸建て/土地/店舗/事務所）
- 住所（郵便番号、都道府県、市区町村、番地、建物名）
- 価格（売買価格または月額賃料）
- 取引形態（売買/賃貸）
- 間取り（1R、1K、1DK、1LDK など）
- 専有面積（㎡）
- 築年数

**任意項目**:
- 物件説明（最大2000文字）
- 画像（最大20枚、各10MB以内、JPEG/PNG/WebP）
- 階数・総階数
- 駐車場の有無
- ペット可否
- リフォーム履歴
- 設備情報（エアコン、床暖房、IHなど）
- 最寄り駅・徒歩分数
- 公開ステータス（公開/非公開/下書き）

#### 2.2 物件編集
- 登録済み物件情報の更新
- 画像の追加・削除・並び替え
- 変更履歴の記録（タイムスタンプ、編集者）

#### 2.3 物件削除
- 論理削除（削除フラグ）
- 管理者による完全削除機能
- 削除前の確認ダイアログ

#### 2.4 PDFインポート機能
**フェーズ1（MVP）**:
- PDF形式の物件資料をアップロード
- テキスト抽出（OCR不要のテキストPDF）
- 抽出データのプレビュー・手動修正
- 一括登録

**将来拡張**:
- OCR対応（スキャン画像からのテキスト抽出）
- 図面PDFからの間取り画像抽出
- AIによる自動分類・タグ付け

### 3. 物件検索・フィルター機能

#### 3.1 検索機能
- **フリーワード検索**: 物件名、住所、説明文
- **絞り込み条件**:
  - 物件種別
  - 価格帯（スライダー入力）
  - 間取り（複数選択可）
  - 面積（範囲指定）
  - 築年数（範囲指定）
  - 駅からの徒歩時間
  - エリア（都道府県、市区町村）
  - 設備（複数選択可）

#### 3.2 ソート機能
- 新着順（デフォルト）
- 価格が安い順/高い順
- 面積が広い順/狭い順
- 築年数が新しい順/古い順

#### 3.3 検索条件の保存
- ログインユーザーは検索条件を保存可能
- 保存した検索条件からワンクリックで再検索

### 4. 物件詳細表示

#### 4.1 表示情報
- 物件基本情報（すべての登録項目）
- 画像ギャラリー（スワイプ対応、拡大表示）
- 地図表示（住所をマーカー表示）
- 周辺施設情報（駅、学校、スーパーなど）
- 類似物件レコメンド

#### 4.2 インタラクション
- お気に入り登録（ログインユーザー）
- 共有機能（URL、SNS）
- 印刷用レイアウト

### 5. ダッシュボード

#### 5.1 管理者ダッシュボード
- 物件登録数（総数、公開中、非公開）
- 新規登録物件（直近7日間）
- ユーザー数・ロール分布
- システム利用統計

#### 5.2 ユーザーダッシュボード
- 自分が登録した物件一覧
- お気に入り物件一覧
- 最近閲覧した物件

---

## 定性的要件

### 1. ユーザビリティ

#### 1.1 直感的なUI
- **明確なナビゲーション**: ヘッダーメニュー、パンくずリスト
- **一貫性のあるデザイン**: カラースキーム、タイポグラフィ、コンポーネント
- **視覚的階層**: 重要情報を強調、アクションボタンを明瞭に配置
- **初心者でも操作可能**: ツールチップ、ヘルプテキスト、エラーガイダンス

#### 1.2 スムーズなUX
- **ページ遷移アニメーション**: Framer Motionによる滑らかなトランジション
- **ローディング状態の明示**: スケルトンスクリーン、スピナー
- **楽観的UI更新**: 操作直後の即座のフィードバック
- **エラーハンドリング**: 分かりやすいエラーメッセージと復旧手順

### 2. レスポンシブデザイン

#### 2.1 デバイス対応
- **モバイル（320px～767px）**: シングルカラムレイアウト、タッチ操作最適化
- **タブレット（768px～1023px）**: 2カラムレイアウト
- **デスクトップ（1024px以上）**: 3カラムレイアウト、サイドバー活用

#### 2.2 タッチ操作
- **タップターゲット**: 最小44x44px
- **スワイプジェスチャー**: 画像ギャラリー、モーダル閉じる
- **ピンチズーム**: 画像・地図の拡大縮小

### 3. パフォーマンス

#### 3.1 ページロード時間
- **目標**: 1秒以内（First Contentful Paint）
- **戦略**:
  - Next.js App Router の Server Components 活用
  - 画像最適化（Next.js Image コンポーネント、WebP形式）
  - コード分割（Dynamic Import）
  - CDNキャッシング

#### 3.2 画像最適化
- **遅延読み込み**: Intersection Observer API
- **レスポンシブ画像**: srcset による適切なサイズ配信
- **プログレッシブ画像**: 低解像度プレースホルダー

#### 3.3 データキャッシング
- **SWR/React Query**: スマートなキャッシュ戦略
- **Supabase Realtime**: 必要な箇所のみリアルタイム更新

### 4. セキュリティ

#### 4.1 認証・認可
- **JWT トークン**: HttpOnly Cookie または localStorage
- **Supabase RLS**: データベースレベルでのアクセス制御
- **CSRF対策**: トークンベースの保護

#### 4.2 入力バリデーション
- **クライアント側**: Zod スキーマバリデーション
- **サーバー側**: Supabase Edge Functions でのバリデーション
- **XSS対策**: React の自動エスケープ、DOMPurify 使用

#### 4.3 ファイルアップロード
- **ファイル形式チェック**: MIME type 検証
- **ファイルサイズ制限**: 画像10MB、PDF20MB
- **ウイルススキャン**: 将来拡張（ClamAV統合）

### 5. アクセシビリティ（WCAG 2.1 Level AA準拠）

#### 5.1 キーボード操作
- **Tab キーナビゲーション**: 論理的な順序
- **フォーカスインジケーター**: 明確な視覚的フィードバック
- **ショートカットキー**: 主要アクション（Ctrl+S で保存など）

#### 5.2 スクリーンリーダー対応
- **セマンティックHTML**: `<nav>`, `<main>`, `<article>` など
- **ARIA属性**: `aria-label`, `aria-describedby` など
- **代替テキスト**: 画像の `alt` 属性必須

#### 5.3 視覚的配慮
- **カラーコントラスト**: 最低4.5:1（テキスト）、3:1（UI要素）
- **フォントサイズ**: 最小16px、拡大200%まで対応
- **色だけに依存しない**: アイコン・テキストラベル併用

### 6. エラーハンドリング・リカバリ

#### 6.1 ネットワークエラー
- **リトライメカニズム**: 自動再試行（指数バックオフ）
- **オフライン検知**: 接続状態の表示
- **エラーメッセージ**: 「ネットワーク接続を確認してください」

#### 6.2 バリデーションエラー
- **リアルタイムバリデーション**: 入力中のフィードバック
- **エラーメッセージ配置**: 該当フィールド直下
- **エラーサマリー**: フォーム上部にすべてのエラーをリスト表示

#### 6.3 システムエラー
- **404ページ**: カスタムデザイン、ホームへのリンク
- **500ページ**: エラーID表示、サポート連絡先
- **エラーログ**: Supabase Logs または外部サービス（Sentry）

---

## データモデル

### Supabase テーブル設計

#### 1. `profiles` テーブル（ユーザー情報）
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `properties` テーブル（物件情報）
```sql
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) NOT NULL,

  -- 基本情報
  name TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('mansion', 'house', 'land', 'shop', 'office')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),

  -- 住所
  postal_code TEXT,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address_line TEXT NOT NULL,
  building_name TEXT,

  -- 価格・面積
  price BIGINT NOT NULL,
  area_sqm DECIMAL(10, 2) NOT NULL,
  layout TEXT NOT NULL, -- '1LDK', '2LDK' など

  -- 建物情報
  building_age INTEGER,
  floor_number INTEGER,
  total_floors INTEGER,

  -- その他
  description TEXT,
  parking_available BOOLEAN DEFAULT FALSE,
  pet_allowed BOOLEAN DEFAULT FALSE,
  nearest_station TEXT,
  walk_minutes INTEGER,

  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### 3. `property_images` テーブル（物件画像）
```sql
CREATE TABLE property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `property_amenities` テーブル（設備情報）
```sql
CREATE TABLE property_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_type TEXT NOT NULL, -- 'air_conditioner', 'floor_heating', 'ih_stove' など
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. `favorites` テーブル（お気に入り）
```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);
```

#### 6. `saved_searches` テーブル（保存した検索条件）
```sql
CREATE TABLE saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) ポリシー

#### profiles テーブル
```sql
-- ユーザーは自分のプロフィールのみ閲覧・更新可能
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### properties テーブル
```sql
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 公開物件は全員閲覧可能
CREATE POLICY "Published properties are viewable by everyone"
  ON properties FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

-- 編集者以上は物件作成可能
CREATE POLICY "Editors can create properties"
  ON properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- 管理者は全物件編集可能、編集者は自分の物件のみ編集可能
CREATE POLICY "Users can update own properties or admins can update all"
  ON properties FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 管理者は全物件削除可能、編集者は自分の物件のみ削除可能
CREATE POLICY "Users can delete own properties or admins can delete all"
  ON properties FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 実装ガイド

### Phase 1: プロジェクトセットアップ（Week 1）

#### ステップ 1.1: 環境構築

```bash
# 既存のNext.jsプロジェクトを確認
cd 1015app

# 必要な依存関係をインストール
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install framer-motion
npm install react-hook-form zod @hookform/resolvers
npm install swr
npm install lucide-react # アイコンライブラリ
npm install clsx tailwind-merge # Tailwind ユーティリティ

# 開発用依存関係
npm install -D @types/node
```

#### ステップ 1.2: Supabase プロジェクトセットアップ

1. [Supabase](https://supabase.com/)でプロジェクト作成
2. データベーステーブル作成（上記のSQLスキーマを実行）
3. RLSポリシー設定
4. Storage バケット作成:
   - `property-images`: 公開、最大10MB
   - `property-pdfs`: 非公開、最大20MB

#### ステップ 1.3: 環境変数設定

`.env.local` ファイル作成:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### ステップ 1.4: プロジェクト構造整理

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── properties/
│   │       ├── page.tsx
│   │       ├── new/
│   │       │   └── page.tsx
│   │       ├── [id]/
│   │       │   ├── page.tsx
│   │       │   └── edit/
│   │       │       └── page.tsx
│   │       └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   ├── property/
│   │   ├── property-card.tsx
│   │   ├── property-form.tsx
│   │   ├── property-filters.tsx
│   │   └── property-gallery.tsx
│   └── auth/
│       └── auth-guard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── hooks/
│   │   ├── use-properties.ts
│   │   ├── use-auth.ts
│   │   └── use-favorites.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   └── types/
│       └── database.types.ts
└── middleware.ts
```

### Phase 2: 認証機能実装（Week 2）

#### ステップ 2.1: Supabase クライアント設定

`src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`src/lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

#### ステップ 2.2: ログイン・サインアップページ

`src/app/(auth)/login/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">ログイン</h1>
        {error && <p className="text-red-500">{error}</p>}
        <Input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full">
          ログイン
        </Button>
      </form>
    </div>
  )
}
```

#### ステップ 2.3: ミドルウェアで認証ガード

`src/middleware.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 認証が必要なパスを保護
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/properties/:path*/edit'],
}
```

### Phase 3: UI コンポーネント作成（Week 3）

#### ステップ 3.1: 共通UIコンポーネント

Tailwind CSS と Framer Motion を使用して再利用可能なコンポーネントを作成:

`src/components/ui/button.tsx`:
```typescript
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'rounded-lg font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

#### ステップ 3.2: レイアウトコンポーネント

`src/components/layout/header.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function Header({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          RealEstate Manager
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">ダッシュボード</Link>
              <Link href="/properties">物件一覧</Link>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" size="sm">
                  ログイン
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
```

### Phase 4: 物件管理機能実装（Week 4-5）

#### ステップ 4.1: 物件一覧ページ

`src/lib/hooks/use-properties.ts`:
```typescript
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

export function useProperties(filters?: any) {
  const supabase = createClient()

  const fetcher = async () => {
    let query = supabase
      .from('properties')
      .select('*, property_images(image_url)')
      .eq('status', 'published')
      .is('deleted_at', null)

    // フィルター適用
    if (filters?.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  return useSWR(['properties', filters], fetcher)
}
```

`src/app/(dashboard)/properties/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useProperties } from '@/lib/hooks/use-properties'
import { PropertyCard } from '@/components/property/property-card'
import { PropertyFilters } from '@/components/property/property-filters'
import { motion } from 'framer-motion'

export default function PropertiesPage() {
  const [filters, setFilters] = useState({})
  const { data: properties, isLoading } = useProperties(filters)

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">物件一覧</h1>

      <div className="flex gap-8">
        <aside className="w-64">
          <PropertyFilters filters={filters} onChange={setFilters} />
        </aside>

        <div className="flex-1">
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {properties?.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
```

#### ステップ 4.2: 物件登録フォーム

`src/app/(dashboard)/properties/new/page.tsx`:
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const propertySchema = z.object({
  name: z.string().min(1, '物件名は必須です').max(100),
  property_type: z.enum(['mansion', 'house', 'land', 'shop', 'office']),
  transaction_type: z.enum(['sale', 'rent']),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address_line: z.string().min(1, '番地は必須です'),
  price: z.number().positive('価格は正の数である必要があります'),
  area_sqm: z.number().positive('面積は正の数である必要があります'),
  layout: z.string().min(1, '間取りは必須です'),
  building_age: z.number().nonnegative().optional(),
  description: z.string().max(2000).optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  })

  const onSubmit = async (data: PropertyFormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('ログインしてください')
      return
    }

    const { error } = await supabase.from('properties').insert({
      ...data,
      created_by: user.id,
      status: 'draft',
    })

    if (error) {
      alert('エラーが発生しました: ' + error.message)
    } else {
      router.push('/properties')
      router.refresh()
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">新規物件登録</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">物件名</label>
          <Input {...register('name')} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">物件種別</label>
          <select {...register('property_type')} className="w-full rounded border p-2">
            <option value="mansion">マンション</option>
            <option value="house">一戸建て</option>
            <option value="land">土地</option>
            <option value="shop">店舗</option>
            <option value="office">事務所</option>
          </select>
        </div>

        {/* 他のフィールドも同様に追加 */}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '登録する'}
        </Button>
      </form>
    </div>
  )
}
```

#### ステップ 4.3: 画像アップロード機能

```typescript
// 画像アップロード関数
async function uploadPropertyImage(file: File, propertyId: string) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${propertyId}/${Math.random()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}
```

### Phase 5: 検索・フィルター機能（Week 6）

#### ステップ 5.1: 高度な検索機能

`src/components/property/property-filters.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FilterProps {
  filters: any
  onChange: (filters: any) => void
}

export function PropertyFilters({ filters, onChange }: FilterProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApply = () => {
    onChange(localFilters)
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h2 className="text-lg font-bold">絞り込み検索</h2>

      <div>
        <label className="block text-sm font-medium">物件種別</label>
        <select
          value={localFilters.propertyType || ''}
          onChange={(e) =>
            setLocalFilters({ ...localFilters, propertyType: e.target.value })
          }
          className="w-full rounded border p-2"
        >
          <option value="">すべて</option>
          <option value="mansion">マンション</option>
          <option value="house">一戸建て</option>
          <option value="land">土地</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">価格帯</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="最低価格"
            value={localFilters.minPrice || ''}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, minPrice: e.target.value })
            }
          />
          <span className="self-center">〜</span>
          <Input
            type="number"
            placeholder="最高価格"
            value={localFilters.maxPrice || ''}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, maxPrice: e.target.value })
            }
          />
        </div>
      </div>

      <Button onClick={handleApply} className="w-full">
        検索
      </Button>
    </div>
  )
}
```

### Phase 6: PDFインポート機能（Week 7）

#### ステップ 6.1: PDFテキスト抽出

```bash
npm install pdf-parse
```

`src/lib/utils/pdf-parser.ts`:
```typescript
import pdf from 'pdf-parse'

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const data = await pdf(buffer)
  return data.text
}

export function parsePropertyDataFromText(text: string) {
  // 簡単な正規表現でデータ抽出（実際のPDFフォーマットに応じて調整）
  const priceMatch = text.match(/価格[:\s]*(\d+)万円/)
  const areaMatch = text.match(/面積[:\s]*([\d.]+)㎡/)
  const layoutMatch = text.match(/間取り[:\s]*(\d+[LDKS]+)/)

  return {
    price: priceMatch ? parseInt(priceMatch[1]) * 10000 : null,
    area_sqm: areaMatch ? parseFloat(areaMatch[1]) : null,
    layout: layoutMatch ? layoutMatch[1] : null,
  }
}
```

### Phase 7: 地図表示機能（Week 8）

#### ステップ 7.1: Google Maps統合

```bash
npm install @react-google-maps/api
```

`src/components/property/property-map.tsx`:
```typescript
'use client'

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

interface PropertyMapProps {
  address: string
  lat?: number
  lng?: number
}

export function PropertyMap({ address, lat, lng }: PropertyMapProps) {
  const center = {
    lat: lat || 35.6812, // デフォルト: 東京
    lng: lng || 139.7671,
  }

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  )
}
```

### Phase 8: 最適化・テスト（Week 9-10）

#### ステップ 8.1: パフォーマンス最適化

1. **画像最適化**:
```typescript
import Image from 'next/image'

<Image
  src={property.image_url}
  alt={property.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

2. **コード分割**:
```typescript
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('@/components/property/property-map'), {
  ssr: false,
  loading: () => <p>地図を読み込み中...</p>,
})
```

3. **キャッシング戦略**:
```typescript
// SWR revalidate設定
const { data } = useSWR('/api/properties', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 60000, // 1分ごとに自動更新
})
```

#### ステップ 8.2: E2Eテスト（Playwright）

```bash
npm install -D @playwright/test
```

`tests/properties.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('should display properties list', async ({ page }) => {
  await page.goto('/properties')
  await expect(page.locator('h1')).toContainText('物件一覧')
  await expect(page.locator('[data-testid="property-card"]')).toHaveCount(10)
})

test('should create new property', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')

  await page.goto('/properties/new')
  await page.fill('input[name="name"]', 'テスト物件')
  await page.selectOption('select[name="property_type"]', 'mansion')
  // ... 他のフィールドも入力
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/properties')
  await expect(page.locator('text=テスト物件')).toBeVisible()
})
```

---

## マイルストーン

| フェーズ | 期間 | 主要成果物 | 担当 |
|---------|------|-----------|------|
| **Phase 1**: プロジェクトセットアップ | Week 1 | 環境構築、Supabase設定、プロジェクト構造 | 全員 |
| **Phase 2**: 認証機能 | Week 2 | ログイン/ログアウト、ミドルウェア、RLS | バックエンド |
| **Phase 3**: UI コンポーネント | Week 3 | 共通コンポーネント、レイアウト | フロントエンド |
| **Phase 4**: 物件管理機能 | Week 4-5 | CRUD操作、画像アップロード | フルスタック |
| **Phase 5**: 検索・フィルター | Week 6 | 高度な検索、ソート機能 | フルスタック |
| **Phase 6**: PDFインポート | Week 7 | PDFパース、データ抽出 | バックエンド |
| **Phase 7**: 地図表示 | Week 8 | Google Maps統合、住所ジオコーディング | フロントエンド |
| **Phase 8**: 最適化・テスト | Week 9-10 | パフォーマンス改善、E2Eテスト、デプロイ | 全員 |

### MVP（Minimum Viable Product）スコープ

最初のリリース（Week 6）に含める機能:
- ✅ ユーザー認証（ログイン/ログアウト）
- ✅ 物件登録・編集・削除
- ✅ 物件一覧表示
- ✅ 基本的な検索・フィルター
- ✅ 物件詳細ページ（画像ギャラリー）
- ✅ レスポンシブデザイン

将来拡張機能:
- 📋 PDFインポート（Week 7）
- 🗺️ 地図表示（Week 8）
- ⭐ お気に入り機能
- 🔔 通知機能
- 📊 ダッシュボード分析
- 🌐 多言語対応

---

## リスクと軽減策

| リスク | 影響度 | 確率 | 軽減策 |
|-------|--------|------|--------|
| Supabase無料枠の制限 | 高 | 中 | 早期にストレージ・DB使用量を監視、必要に応じて有料プラン移行 |
| PDF解析の精度不足 | 中 | 高 | MVP ではマニュアル入力を優先、PDF は補助機能として実装 |
| パフォーマンス問題 | 高 | 中 | 初期から画像最適化・キャッシングを実装、定期的な負荷テスト |
| セキュリティ脆弱性 | 高 | 低 | RLS 徹底、定期的なセキュリティ監査、入力バリデーション強化 |

---

## 付録

### A. 参考資料
- [Next.js 15 ドキュメント](https://nextjs.org/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Framer Motion ドキュメント](https://www.framer.com/motion/)

### B. 開発環境
- **Node.js**: v20.x以上
- **npm**: v10.x以上
- **エディタ**: VSCode推奨（ESLint, Prettier拡張機能）

### C. チーム構成（推奨）
- フロントエンドエンジニア: 1名
- バックエンドエンジニア: 1名
- UI/UXデザイナー: 1名
- プロジェクトマネージャー: 1名

---

**承認者**: _______________
**承認日**: _______________
