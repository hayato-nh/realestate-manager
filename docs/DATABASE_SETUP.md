# データベースセットアップガイド

## 概要

このドキュメントでは、不動産物件管理アプリケーションのSupabaseデータベースのセットアップ手順を説明します。

## テーブル命名規則

**重要**: すべてのテーブル名には `hn_pi_` プレフィックスを付ける必要があります。

例:
- ユーザー情報 → `hn_pi_profiles`
- 物件情報 → `hn_pi_properties`
- 物件画像 → `hn_pi_property_images`

---

## セットアップ手順

### ステップ 1: Supabase プロジェクトにアクセス

1. [Supabase Dashboard](https://app.supabase.com/)にログイン
2. 作成済みのプロジェクトを選択
3. 左サイドバーから **SQL Editor** を選択

### ステップ 2: データベースのマイグレーション実行

以下の手順で SQL マイグレーションを実行します：

1. SQL Editor で **New Query** をクリック
2. `docs/migrations/01_initial_schema.sql` の内容をコピー＆ペースト
3. **Run** ボタンをクリックして実行
4. 成功メッセージを確認

### ステップ 3: Row Level Security (RLS) ポリシーの設定

1. SQL Editor で **New Query** をクリック
2. `docs/migrations/02_rls_policies.sql` の内容をコピー＆ペースト
3. **Run** ボタンをクリックして実行
4. 成功メッセージを確認

### ステップ 4: Storage バケットの作成

1. 左サイドバーから **Storage** を選択
2. **New bucket** をクリック

#### バケット 1: property-images（物件画像）
- **Name**: `property-images`
- **Public**: ✅ チェックを入れる
- **File size limit**: 10 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`

#### バケット 2: property-pdfs（物件PDF）
- **Name**: `property-pdfs`
- **Public**: ❌ チェックを外す
- **File size limit**: 20 MB
- **Allowed MIME types**: `application/pdf`

### ステップ 5: Storage ポリシーの設定

SQL Editor で以下を実行：

```sql
-- property-images バケットのポリシー
-- 認証済みユーザーは画像をアップロード可能
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- 画像は全員が閲覧可能（パブリックバケット）
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- property-pdfs バケットのポリシー
-- 編集者以上はPDFをアップロード可能
CREATE POLICY "Editors can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-pdfs' AND
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  )
);

-- PDFは編集者以上のみ閲覧可能
CREATE POLICY "Editors can view PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-pdfs' AND
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  )
);
```

### ステップ 6: 環境変数の設定

プロジェクトルートの `.env.local` ファイルを更新：

1. Supabase Dashboard の **Settings** → **API** にアクセス
2. 以下の情報をコピー：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Maps (オプション: Phase 7 で使用)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

⚠️ **重要**: `.env.local` ファイルは `.gitignore` に含まれていることを確認してください。

---

## データベーススキーマ詳細

### テーブル一覧

| テーブル名 | 説明 | 主な用途 |
|-----------|------|---------|
| `hn_pi_profiles` | ユーザープロフィール | 認証、ロール管理 |
| `hn_pi_properties` | 物件情報 | 物件の基本情報 |
| `hn_pi_property_images` | 物件画像 | 物件の写真 |
| `hn_pi_property_amenities` | 物件設備 | エアコン、駐車場など |
| `hn_pi_favorites` | お気に入り | ユーザーのお気に入り物件 |
| `hn_pi_saved_searches` | 保存した検索 | 検索条件の保存 |
| `hn_pi_view_history` | 閲覧履歴 | 最近見た物件 |

### リレーションシップ図

```
auth.users (Supabase Auth)
    ↓ 1:1
hn_pi_profiles
    ↓ 1:N
hn_pi_properties ← 作成者
    ↓ 1:N
    ├── hn_pi_property_images
    └── hn_pi_property_amenities

hn_pi_profiles ← ユーザー
    ↓ 1:N
    ├── hn_pi_favorites → hn_pi_properties
    ├── hn_pi_saved_searches
    └── hn_pi_view_history → hn_pi_properties
```

---

## テーブル詳細仕様

### 1. hn_pi_profiles（ユーザープロフィール）

```sql
CREATE TABLE hn_pi_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**カラム説明**:
- `id`: Supabase Auth の user_id と紐付け
- `email`: メールアドレス（ユニーク）
- `full_name`: フルネーム
- `role`: ユーザーロール（admin/editor/viewer）
- `avatar_url`: プロフィール画像URL
- `created_at`: 作成日時
- `updated_at`: 更新日時

**ロールの権限**:
- `admin`: すべての操作が可能
- `editor`: 物件の作成・編集・削除
- `viewer`: 物件の閲覧のみ

### 2. hn_pi_properties（物件情報）

```sql
CREATE TABLE hn_pi_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES hn_pi_profiles(id) NOT NULL,

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
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 価格・面積
  price BIGINT NOT NULL,
  area_sqm DECIMAL(10, 2) NOT NULL,
  layout TEXT NOT NULL,

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
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

**カラム説明**:
- `property_type`: 物件種別（マンション/一戸建て/土地/店舗/事務所）
- `transaction_type`: 取引形態（売買/賃貸）
- `status`: 公開状態（下書き/公開/非公開）
- `price`: 価格（円）
- `area_sqm`: 専有面積（平方メートル）
- `layout`: 間取り（例: 1LDK, 2DK）
- `latitude`, `longitude`: 緯度経度（地図表示用）
- `view_count`: 閲覧数
- `deleted_at`: 論理削除用（NULL = 削除されていない）

### 3. hn_pi_property_images（物件画像）

```sql
CREATE TABLE hn_pi_property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**カラム説明**:
- `property_id`: 物件IDへの外部キー
- `image_url`: Supabase Storage の画像URL
- `display_order`: 表示順序（0が最初）
- `caption`: 画像の説明
- `is_main`: メイン画像フラグ（一覧表示用）

### 4. hn_pi_property_amenities（物件設備）

```sql
CREATE TABLE hn_pi_property_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE,
  amenity_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, amenity_type)
);
```

**amenity_type の値**:
- `air_conditioner`: エアコン
- `floor_heating`: 床暖房
- `ih_stove`: IHクッキングヒーター
- `auto_lock`: オートロック
- `intercom`: インターホン
- `balcony`: バルコニー
- `storage`: 収納
- `walk_in_closet`: ウォークインクローゼット
- `separate_bathroom`: バス・トイレ別
- `washlet`: ウォシュレット
- `system_kitchen`: システムキッチン
- `counter_kitchen`: カウンターキッチン

### 5. hn_pi_favorites（お気に入り）

```sql
CREATE TABLE hn_pi_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hn_pi_profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);
```

### 6. hn_pi_saved_searches（保存した検索）

```sql
CREATE TABLE hn_pi_saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hn_pi_profiles(id) ON DELETE CASCADE,
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**search_criteria の例**:
```json
{
  "propertyType": "mansion",
  "minPrice": 5000000,
  "maxPrice": 10000000,
  "layout": ["1LDK", "2LDK"],
  "prefecture": "東京都",
  "amenities": ["air_conditioner", "auto_lock"]
}
```

### 7. hn_pi_view_history（閲覧履歴）

```sql
CREATE TABLE hn_pi_view_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hn_pi_profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## インデックスの作成

パフォーマンス向上のため、以下のインデックスを作成します：

```sql
-- 物件検索用インデックス
CREATE INDEX idx_properties_status ON hn_pi_properties(status);
CREATE INDEX idx_properties_property_type ON hn_pi_properties(property_type);
CREATE INDEX idx_properties_prefecture ON hn_pi_properties(prefecture);
CREATE INDEX idx_properties_price ON hn_pi_properties(price);
CREATE INDEX idx_properties_area_sqm ON hn_pi_properties(area_sqm);
CREATE INDEX idx_properties_created_at ON hn_pi_properties(created_at DESC);

-- 論理削除された物件を除外
CREATE INDEX idx_properties_not_deleted ON hn_pi_properties(deleted_at) WHERE deleted_at IS NULL;

-- 全文検索用インデックス（物件名・説明）
CREATE INDEX idx_properties_name_search ON hn_pi_properties USING gin(to_tsvector('japanese', name));
CREATE INDEX idx_properties_description_search ON hn_pi_properties USING gin(to_tsvector('japanese', description));

-- 物件画像の表示順インデックス
CREATE INDEX idx_property_images_property_id ON hn_pi_property_images(property_id, display_order);

-- お気に入り検索用
CREATE INDEX idx_favorites_user_id ON hn_pi_favorites(user_id);
CREATE INDEX idx_favorites_property_id ON hn_pi_favorites(property_id);
```

---

## トリガーの設定

### 自動更新日時トリガー

```sql
-- updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- hn_pi_profiles テーブルにトリガーを設定
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON hn_pi_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- hn_pi_properties テーブルにトリガーを設定
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON hn_pi_properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 新規ユーザー自動プロフィール作成

```sql
-- 新規ユーザー登録時に自動的にプロフィールを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.hn_pi_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを設定
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

---

## 初期データの投入

### 管理者ユーザーの作成

1. Supabase Dashboard の **Authentication** → **Users** にアクセス
2. **Add user** をクリック
3. メールアドレスとパスワードを入力して作成
4. 作成したユーザーの `id` をコピー

5. SQL Editor で以下を実行（`USER_ID_HERE` を実際のIDに置き換え）：

```sql
-- 管理者ロールを付与
UPDATE hn_pi_profiles
SET role = 'admin', full_name = '管理者'
WHERE id = 'USER_ID_HERE';
```

### サンプル物件データ（オプション）

```sql
-- サンプル物件の投入
INSERT INTO hn_pi_properties (
  created_by,
  name,
  property_type,
  transaction_type,
  status,
  prefecture,
  city,
  address_line,
  price,
  area_sqm,
  layout,
  building_age,
  description
) VALUES (
  'USER_ID_HERE',
  '駅近マンション',
  'mansion',
  'sale',
  'published',
  '東京都',
  '渋谷区',
  '道玄坂1-1-1',
  35000000,
  60.5,
  '2LDK',
  5,
  '駅徒歩3分の好立地。南向きで日当たり良好。'
);
```

---

## トラブルシューティング

### エラー: "relation does not exist"

**原因**: テーブルが作成されていない

**解決策**:
1. SQL Editor で `\dt` を実行してテーブル一覧を確認
2. テーブルが存在しない場合、マイグレーションを再実行

### エラー: "permission denied for table"

**原因**: RLS ポリシーが正しく設定されていない

**解決策**:
1. SQL Editor で以下を実行して RLS を一時的に無効化:
```sql
ALTER TABLE hn_pi_properties DISABLE ROW LEVEL SECURITY;
```
2. 問題を特定後、RLS を再度有効化して正しいポリシーを設定

### Storage バケットにアップロードできない

**原因**: Storage ポリシーが設定されていない

**解決策**:
1. **Storage** → 該当バケット → **Policies** タブを開く
2. ステップ 5 の Storage ポリシーを再実行

---

## 次のステップ

データベースのセットアップが完了したら:

1. ✅ `docs/migrations/01_initial_schema.sql` を実行
2. ✅ `docs/migrations/02_rls_policies.sql` を実行
3. ✅ Storage バケットを作成
4. ✅ `.env.local` に環境変数を設定
5. 📝 Next.js アプリケーションで Supabase クライアントを設定（Phase 2）

---

## 参考資料

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
