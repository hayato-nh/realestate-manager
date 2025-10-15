-- ============================================================
-- 不動産物件管理アプリ - 初期スキーマ
-- ============================================================
-- 作成日: 2025-10-15
-- 説明: すべてのテーブルに hn_pi_ プレフィックスを使用
-- ============================================================

-- ============================================================
-- 1. hn_pi_profiles テーブル（ユーザープロフィール）
-- ============================================================

CREATE TABLE hn_pi_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロフィールテーブルのコメント
COMMENT ON TABLE hn_pi_profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN hn_pi_profiles.id IS 'Supabase Auth の user_id';
COMMENT ON COLUMN hn_pi_profiles.role IS 'ユーザーロール: admin(管理者), editor(編集者), viewer(閲覧者)';

-- ============================================================
-- 2. hn_pi_properties テーブル（物件情報）
-- ============================================================

CREATE TABLE hn_pi_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES hn_pi_profiles(id) NOT NULL,

  -- 基本情報
  name TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('mansion', 'house', 'land', 'shop', 'office')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),

  -- 住所情報
  postal_code TEXT,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address_line TEXT NOT NULL,
  building_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 価格・面積
  price BIGINT NOT NULL CHECK (price > 0),
  area_sqm DECIMAL(10, 2) NOT NULL CHECK (area_sqm > 0),
  layout TEXT NOT NULL,

  -- 建物情報
  building_age INTEGER CHECK (building_age >= 0),
  floor_number INTEGER,
  total_floors INTEGER CHECK (total_floors > 0),

  -- 追加情報
  description TEXT,
  parking_available BOOLEAN DEFAULT FALSE,
  pet_allowed BOOLEAN DEFAULT FALSE,
  nearest_station TEXT,
  walk_minutes INTEGER CHECK (walk_minutes >= 0),

  -- メタデータ
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 物件テーブルのコメント
COMMENT ON TABLE hn_pi_properties IS '物件情報';
COMMENT ON COLUMN hn_pi_properties.property_type IS '物件種別: mansion(マンション), house(一戸建て), land(土地), shop(店舗), office(事務所)';
COMMENT ON COLUMN hn_pi_properties.transaction_type IS '取引形態: sale(売買), rent(賃貸)';
COMMENT ON COLUMN hn_pi_properties.status IS '公開状態: draft(下書き), published(公開), unpublished(非公開)';
COMMENT ON COLUMN hn_pi_properties.price IS '価格（円）';
COMMENT ON COLUMN hn_pi_properties.area_sqm IS '専有面積（平方メートル）';
COMMENT ON COLUMN hn_pi_properties.deleted_at IS '論理削除用（NULL = 削除されていない）';

-- ============================================================
-- 3. hn_pi_property_images テーブル（物件画像）
-- ============================================================

CREATE TABLE hn_pi_property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  caption TEXT,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 物件画像テーブルのコメント
COMMENT ON TABLE hn_pi_property_images IS '物件画像';
COMMENT ON COLUMN hn_pi_property_images.display_order IS '表示順序（0が最初）';
COMMENT ON COLUMN hn_pi_property_images.is_main IS 'メイン画像フラグ（一覧表示用）';

-- ============================================================
-- 4. hn_pi_property_amenities テーブル（物件設備）
-- ============================================================

CREATE TABLE hn_pi_property_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE NOT NULL,
  amenity_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, amenity_type)
);

-- 物件設備テーブルのコメント
COMMENT ON TABLE hn_pi_property_amenities IS '物件設備情報';
COMMENT ON COLUMN hn_pi_property_amenities.amenity_type IS '設備種別: air_conditioner, floor_heating, ih_stove, auto_lock, intercom, balcony, storage, walk_in_closet, separate_bathroom, washlet, system_kitchen, counter_kitchen など';

-- ============================================================
-- 5. hn_pi_favorites テーブル（お気に入り）
-- ============================================================

CREATE TABLE hn_pi_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hn_pi_profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- お気に入りテーブルのコメント
COMMENT ON TABLE hn_pi_favorites IS 'ユーザーのお気に入り物件';

-- ============================================================
-- 6. hn_pi_saved_searches テーブル（保存した検索）
-- ============================================================

CREATE TABLE hn_pi_saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hn_pi_profiles(id) ON DELETE CASCADE NOT NULL,
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 保存した検索テーブルのコメント
COMMENT ON TABLE hn_pi_saved_searches IS 'ユーザーが保存した検索条件';
COMMENT ON COLUMN hn_pi_saved_searches.search_criteria IS '検索条件をJSON形式で保存';

-- ============================================================
-- 7. hn_pi_view_history テーブル（閲覧履歴）
-- ============================================================

CREATE TABLE hn_pi_view_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES hn_pi_profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES hn_pi_properties(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 閲覧履歴テーブルのコメント
COMMENT ON TABLE hn_pi_view_history IS 'ユーザーの物件閲覧履歴';

-- ============================================================
-- インデックスの作成
-- ============================================================

-- 物件検索用インデックス
CREATE INDEX idx_properties_status ON hn_pi_properties(status);
CREATE INDEX idx_properties_property_type ON hn_pi_properties(property_type);
CREATE INDEX idx_properties_transaction_type ON hn_pi_properties(transaction_type);
CREATE INDEX idx_properties_prefecture ON hn_pi_properties(prefecture);
CREATE INDEX idx_properties_city ON hn_pi_properties(city);
CREATE INDEX idx_properties_price ON hn_pi_properties(price);
CREATE INDEX idx_properties_area_sqm ON hn_pi_properties(area_sqm);
CREATE INDEX idx_properties_building_age ON hn_pi_properties(building_age);
CREATE INDEX idx_properties_created_at ON hn_pi_properties(created_at DESC);
CREATE INDEX idx_properties_created_by ON hn_pi_properties(created_by);

-- 論理削除された物件を除外するインデックス
CREATE INDEX idx_properties_not_deleted ON hn_pi_properties(deleted_at) WHERE deleted_at IS NULL;

-- 公開中の物件を効率的に取得するインデックス
CREATE INDEX idx_properties_published ON hn_pi_properties(status, deleted_at) WHERE status = 'published' AND deleted_at IS NULL;

-- テキスト検索用インデックス（ILIKE検索用）
-- 注: より高度な全文検索が必要な場合は、pg_trgm 拡張機能を使用
CREATE INDEX idx_properties_name_lower ON hn_pi_properties(LOWER(name));
CREATE INDEX idx_properties_description_lower ON hn_pi_properties(LOWER(description));

-- トライグラム検索用インデックス（オプション: pg_trgm拡張が有効な場合）
-- 部分一致検索のパフォーマンスを大幅に向上
-- Supabase ではデフォルトで pg_trgm が有効なので、これらのインデックスを使用できます
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_properties_name_trgm ON hn_pi_properties USING gin(name gin_trgm_ops);
CREATE INDEX idx_properties_description_trgm ON hn_pi_properties USING gin(description gin_trgm_ops);

-- 物件画像の表示順インデックス
CREATE INDEX idx_property_images_property_id ON hn_pi_property_images(property_id, display_order);
CREATE INDEX idx_property_images_main ON hn_pi_property_images(property_id, is_main) WHERE is_main = TRUE;

-- 物件設備の検索用インデックス
CREATE INDEX idx_property_amenities_property_id ON hn_pi_property_amenities(property_id);
CREATE INDEX idx_property_amenities_type ON hn_pi_property_amenities(amenity_type);

-- お気に入り検索用インデックス
CREATE INDEX idx_favorites_user_id ON hn_pi_favorites(user_id);
CREATE INDEX idx_favorites_property_id ON hn_pi_favorites(property_id);
CREATE INDEX idx_favorites_created_at ON hn_pi_favorites(created_at DESC);

-- 保存した検索用インデックス
CREATE INDEX idx_saved_searches_user_id ON hn_pi_saved_searches(user_id);

-- 閲覧履歴用インデックス
CREATE INDEX idx_view_history_user_id ON hn_pi_view_history(user_id, viewed_at DESC);
CREATE INDEX idx_view_history_property_id ON hn_pi_view_history(property_id);

-- ============================================================
-- トリガー関数の作成
-- ============================================================

-- updated_at 自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- トリガーの設定
-- ============================================================

-- hn_pi_profiles の updated_at 自動更新
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON hn_pi_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- hn_pi_properties の updated_at 自動更新
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON hn_pi_properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 新規ユーザー自動プロフィール作成
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.hn_pi_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー作成時にプロフィールを自動生成
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 物件閲覧数カウント関数
-- ============================================================

CREATE OR REPLACE FUNCTION increment_property_view_count(property_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE hn_pi_properties
  SET view_count = view_count + 1
  WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 完了メッセージ
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '初期スキーマの作成が完了しました！';
  RAISE NOTICE '次のステップ: docs/migrations/02_rls_policies.sql を実行してください';
END $$;
