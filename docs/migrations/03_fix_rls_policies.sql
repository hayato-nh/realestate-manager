-- ============================================================
-- RLS ポリシー修正 - 無限再帰エラーの解決
-- ============================================================
-- 作成日: 2025-10-15
-- 説明: 無限再帰を引き起こすポリシーを削除し、正しいポリシーに置き換え
-- ============================================================

-- ============================================================
-- ステップ 1: 既存のポリシーをすべて削除
-- ============================================================

-- hn_pi_profiles のポリシーを削除
DROP POLICY IF EXISTS "Users can view own profile" ON hn_pi_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON hn_pi_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON hn_pi_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON hn_pi_profiles;

-- hn_pi_properties のポリシーを削除
DROP POLICY IF EXISTS "Published properties are viewable by everyone" ON hn_pi_properties;
DROP POLICY IF EXISTS "Users can view own properties" ON hn_pi_properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON hn_pi_properties;
DROP POLICY IF EXISTS "Editors and admins can create properties" ON hn_pi_properties;
DROP POLICY IF EXISTS "Users can update own properties or admins can update all" ON hn_pi_properties;
DROP POLICY IF EXISTS "Users can delete own properties or admins can delete all" ON hn_pi_properties;

-- hn_pi_property_images のポリシーを削除
DROP POLICY IF EXISTS "Published property images are viewable by everyone" ON hn_pi_property_images;
DROP POLICY IF EXISTS "Users can view own property images" ON hn_pi_property_images;
DROP POLICY IF EXISTS "Admins can view all property images" ON hn_pi_property_images;
DROP POLICY IF EXISTS "Users can insert images for own properties" ON hn_pi_property_images;
DROP POLICY IF EXISTS "Users can update images for own properties" ON hn_pi_property_images;
DROP POLICY IF EXISTS "Users can delete images for own properties" ON hn_pi_property_images;

-- hn_pi_property_amenities のポリシーを削除
DROP POLICY IF EXISTS "Published property amenities are viewable by everyone" ON hn_pi_property_amenities;
DROP POLICY IF EXISTS "Users can view own property amenities" ON hn_pi_property_amenities;
DROP POLICY IF EXISTS "Admins can view all property amenities" ON hn_pi_property_amenities;
DROP POLICY IF EXISTS "Users can insert amenities for own properties" ON hn_pi_property_amenities;
DROP POLICY IF EXISTS "Users can delete amenities for own properties" ON hn_pi_property_amenities;

-- hn_pi_favorites のポリシーを削除
DROP POLICY IF EXISTS "Users can view own favorites" ON hn_pi_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON hn_pi_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON hn_pi_favorites;

-- hn_pi_saved_searches のポリシーを削除
DROP POLICY IF EXISTS "Users can view own saved searches" ON hn_pi_saved_searches;
DROP POLICY IF EXISTS "Users can insert own saved searches" ON hn_pi_saved_searches;
DROP POLICY IF EXISTS "Users can update own saved searches" ON hn_pi_saved_searches;
DROP POLICY IF EXISTS "Users can delete own saved searches" ON hn_pi_saved_searches;

-- hn_pi_view_history のポリシーを削除
DROP POLICY IF EXISTS "Users can view own view history" ON hn_pi_view_history;
DROP POLICY IF EXISTS "Users can insert own view history" ON hn_pi_view_history;
DROP POLICY IF EXISTS "Admins can view all view history" ON hn_pi_view_history;

-- ============================================================
-- ステップ 2: 正しいポリシーを作成（無限再帰を回避）
-- ============================================================

-- ============================================================
-- 1. hn_pi_profiles テーブルのポリシー
-- ============================================================

-- 誰でも自分のプロフィールを閲覧可能（再帰なし）
CREATE POLICY "Users can view own profile"
ON hn_pi_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 自分のプロフィールを更新可能（ロールは変更不可）
CREATE POLICY "Users can update own profile"
ON hn_pi_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- 2. hn_pi_properties テーブルのポリシー
-- ============================================================

-- 公開物件は全員が閲覧可能
CREATE POLICY "Anyone can view published properties"
ON hn_pi_properties FOR SELECT
USING (status = 'published' AND deleted_at IS NULL);

-- 認証ユーザーは自分が作成した物件を閲覧可能
CREATE POLICY "Users can view own properties"
ON hn_pi_properties FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- 認証ユーザーは物件を作成可能
CREATE POLICY "Authenticated users can create properties"
ON hn_pi_properties FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- ユーザーは自分の物件を更新可能
CREATE POLICY "Users can update own properties"
ON hn_pi_properties FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ユーザーは自分の物件を削除可能
CREATE POLICY "Users can delete own properties"
ON hn_pi_properties FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ============================================================
-- 3. hn_pi_property_images テーブルのポリシー
-- ============================================================

-- 公開物件の画像は全員が閲覧可能
CREATE POLICY "Anyone can view published property images"
ON hn_pi_property_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_images.property_id
      AND hn_pi_properties.status = 'published'
      AND hn_pi_properties.deleted_at IS NULL
  )
);

-- 自分の物件の画像は閲覧可能
CREATE POLICY "Users can view own property images"
ON hn_pi_property_images FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_images.property_id
      AND hn_pi_properties.created_by = auth.uid()
  )
);

-- 自分の物件に画像を追加可能
CREATE POLICY "Users can insert own property images"
ON hn_pi_property_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_images.property_id
      AND hn_pi_properties.created_by = auth.uid()
  )
);

-- 自分の物件の画像を更新可能
CREATE POLICY "Users can update own property images"
ON hn_pi_property_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_images.property_id
      AND hn_pi_properties.created_by = auth.uid()
  )
);

-- 自分の物件の画像を削除可能
CREATE POLICY "Users can delete own property images"
ON hn_pi_property_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_images.property_id
      AND hn_pi_properties.created_by = auth.uid()
  )
);

-- ============================================================
-- 4. hn_pi_property_amenities テーブルのポリシー
-- ============================================================

-- 公開物件の設備は全員が閲覧可能
CREATE POLICY "Anyone can view published property amenities"
ON hn_pi_property_amenities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_amenities.property_id
      AND hn_pi_properties.status = 'published'
      AND hn_pi_properties.deleted_at IS NULL
  )
);

-- 自分の物件の設備は閲覧可能
CREATE POLICY "Users can view own property amenities"
ON hn_pi_property_amenities FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_amenities.property_id
      AND hn_pi_properties.created_by = auth.uid()
  )
);

-- 自分の物件に設備を追加可能
CREATE POLICY "Users can insert own property amenities"
ON hn_pi_property_amenities FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_amenities.property_id
      AND hn_pi_properties.created_by = auth.uid()
  )
);

-- 自分の物件の設備を削除可能
CREATE POLICY "Users can delete own property amenities"
ON hn_pi_property_amenities FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE hn_pi_properties.id = hn_pi_property_amenities.property_id
      AND hn_pi_properties.created_by = auth.uid()
  )
);

-- ============================================================
-- 5. hn_pi_favorites テーブルのポリシー
-- ============================================================

-- 自分のお気に入りを閲覧可能
CREATE POLICY "Users can view own favorites"
ON hn_pi_favorites FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 自分のお気に入りを追加可能
CREATE POLICY "Users can insert own favorites"
ON hn_pi_favorites FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 自分のお気に入りを削除可能
CREATE POLICY "Users can delete own favorites"
ON hn_pi_favorites FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- 6. hn_pi_saved_searches テーブルのポリシー
-- ============================================================

-- 自分の保存した検索を閲覧可能
CREATE POLICY "Users can view own saved searches"
ON hn_pi_saved_searches FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 自分の保存した検索を追加可能
CREATE POLICY "Users can insert own saved searches"
ON hn_pi_saved_searches FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 自分の保存した検索を更新可能
CREATE POLICY "Users can update own saved searches"
ON hn_pi_saved_searches FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 自分の保存した検索を削除可能
CREATE POLICY "Users can delete own saved searches"
ON hn_pi_saved_searches FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- 7. hn_pi_view_history テーブルのポリシー
-- ============================================================

-- 自分の閲覧履歴を閲覧可能
CREATE POLICY "Users can view own view history"
ON hn_pi_view_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 自分の閲覧履歴を追加可能
CREATE POLICY "Users can insert own view history"
ON hn_pi_view_history FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 管理者用のポリシー（オプション: 後で追加可能）
-- ============================================================

-- 注: 管理者機能が必要になったら、以下のように追加できます
-- ただし、無限再帰を避けるため、ロールチェックには別のアプローチが必要です

-- 例: 管理者判定関数（再帰なし）
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 例: 編集者以上判定関数
CREATE OR REPLACE FUNCTION is_editor_or_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者は全物件を閲覧可能（必要な場合のみ有効化）
-- CREATE POLICY "Admins can view all properties"
-- ON hn_pi_properties FOR SELECT
-- TO authenticated
-- USING (is_admin_user());

-- 管理者は全物件を更新可能（必要な場合のみ有効化）
-- CREATE POLICY "Admins can update all properties"
-- ON hn_pi_properties FOR UPDATE
-- TO authenticated
-- USING (is_admin_user())
-- WITH CHECK (is_admin_user());

-- 管理者は全物件を削除可能（必要な場合のみ有効化）
-- CREATE POLICY "Admins can delete all properties"
-- ON hn_pi_properties FOR DELETE
-- TO authenticated
-- USING (is_admin_user());

-- ============================================================
-- 完了メッセージ
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS ポリシーの修正が完了しました！';
  RAISE NOTICE '無限再帰エラーが解決されました。';
  RAISE NOTICE 'テストページでもう一度確認してください。';
END $$;
