-- ============================================================
-- 不動産物件管理アプリ - Row Level Security (RLS) ポリシー
-- ============================================================
-- 作成日: 2025-10-15
-- 説明: データベースレベルでのアクセス制御
-- 前提: 01_initial_schema.sql が実行済みであること
-- ============================================================

-- ============================================================
-- RLS の有効化
-- ============================================================

ALTER TABLE hn_pi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hn_pi_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE hn_pi_property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hn_pi_property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hn_pi_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE hn_pi_saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE hn_pi_view_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. hn_pi_profiles テーブルのポリシー
-- ============================================================

-- プロフィール閲覧: 自分のプロフィールのみ
CREATE POLICY "Users can view own profile"
ON hn_pi_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- プロフィール更新: 自分のプロフィールのみ（ロールは変更不可）
CREATE POLICY "Users can update own profile"
ON hn_pi_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  role = (SELECT role FROM hn_pi_profiles WHERE id = auth.uid())
);

-- 管理者は全プロフィール閲覧可能
CREATE POLICY "Admins can view all profiles"
ON hn_pi_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 管理者は全プロフィール更新可能（ロール変更含む）
CREATE POLICY "Admins can update all profiles"
ON hn_pi_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- 2. hn_pi_properties テーブルのポリシー
-- ============================================================

-- 公開物件は全員（未認証含む）が閲覧可能
CREATE POLICY "Published properties are viewable by everyone"
ON hn_pi_properties FOR SELECT
TO public
USING (
  status = 'published' AND
  deleted_at IS NULL
);

-- 認証ユーザーは自分が作成した物件を閲覧可能（ステータス問わず）
CREATE POLICY "Users can view own properties"
ON hn_pi_properties FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() AND
  deleted_at IS NULL
);

-- 管理者は全物件閲覧可能（削除済み含む）
CREATE POLICY "Admins can view all properties"
ON hn_pi_properties FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 編集者以上は物件を作成可能
CREATE POLICY "Editors and admins can create properties"
ON hn_pi_properties FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  ) AND
  created_by = auth.uid()
);

-- 編集者は自分の物件を更新可能、管理者は全物件更新可能
CREATE POLICY "Users can update own properties or admins can update all"
ON hn_pi_properties FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 編集者は自分の物件を削除可能、管理者は全物件削除可能
CREATE POLICY "Users can delete own properties or admins can delete all"
ON hn_pi_properties FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- 3. hn_pi_property_images テーブルのポリシー
-- ============================================================

-- 公開物件の画像は全員が閲覧可能
CREATE POLICY "Published property images are viewable by everyone"
ON hn_pi_property_images FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_images.property_id
      AND status = 'published'
      AND deleted_at IS NULL
  )
);

-- 自分の物件の画像は閲覧可能
CREATE POLICY "Users can view own property images"
ON hn_pi_property_images FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_images.property_id
      AND created_by = auth.uid()
      AND deleted_at IS NULL
  )
);

-- 管理者は全画像閲覧可能
CREATE POLICY "Admins can view all property images"
ON hn_pi_property_images FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 編集者は自分の物件に画像を追加可能
CREATE POLICY "Users can insert images for own properties"
ON hn_pi_property_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_images.property_id
      AND created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 編集者は自分の物件の画像を更新可能
CREATE POLICY "Users can update images for own properties"
ON hn_pi_property_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_images.property_id
      AND created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 編集者は自分の物件の画像を削除可能
CREATE POLICY "Users can delete images for own properties"
ON hn_pi_property_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_images.property_id
      AND created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- 4. hn_pi_property_amenities テーブルのポリシー
-- ============================================================

-- 公開物件の設備は全員が閲覧可能
CREATE POLICY "Published property amenities are viewable by everyone"
ON hn_pi_property_amenities FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_amenities.property_id
      AND status = 'published'
      AND deleted_at IS NULL
  )
);

-- 自分の物件の設備は閲覧可能
CREATE POLICY "Users can view own property amenities"
ON hn_pi_property_amenities FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_amenities.property_id
      AND created_by = auth.uid()
      AND deleted_at IS NULL
  )
);

-- 管理者は全設備閲覧可能
CREATE POLICY "Admins can view all property amenities"
ON hn_pi_property_amenities FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 編集者は自分の物件に設備を追加可能
CREATE POLICY "Users can insert amenities for own properties"
ON hn_pi_property_amenities FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_amenities.property_id
      AND created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 編集者は自分の物件の設備を削除可能
CREATE POLICY "Users can delete amenities for own properties"
ON hn_pi_property_amenities FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_properties
    WHERE id = hn_pi_property_amenities.property_id
      AND created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- 5. hn_pi_favorites テーブルのポリシー
-- ============================================================

-- ユーザーは自分のお気に入りのみ閲覧可能
CREATE POLICY "Users can view own favorites"
ON hn_pi_favorites FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ユーザーは自分のお気に入りを追加可能
CREATE POLICY "Users can insert own favorites"
ON hn_pi_favorites FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ユーザーは自分のお気に入りを削除可能
CREATE POLICY "Users can delete own favorites"
ON hn_pi_favorites FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- 6. hn_pi_saved_searches テーブルのポリシー
-- ============================================================

-- ユーザーは自分の保存した検索のみ閲覧可能
CREATE POLICY "Users can view own saved searches"
ON hn_pi_saved_searches FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ユーザーは自分の保存した検索を追加可能
CREATE POLICY "Users can insert own saved searches"
ON hn_pi_saved_searches FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ユーザーは自分の保存した検索を更新可能
CREATE POLICY "Users can update own saved searches"
ON hn_pi_saved_searches FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ユーザーは自分の保存した検索を削除可能
CREATE POLICY "Users can delete own saved searches"
ON hn_pi_saved_searches FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- 7. hn_pi_view_history テーブルのポリシー
-- ============================================================

-- ユーザーは自分の閲覧履歴のみ閲覧可能
CREATE POLICY "Users can view own view history"
ON hn_pi_view_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ユーザーは自分の閲覧履歴を追加可能
CREATE POLICY "Users can insert own view history"
ON hn_pi_view_history FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 管理者は全閲覧履歴を閲覧可能（分析用）
CREATE POLICY "Admins can view all view history"
ON hn_pi_view_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- ヘルパー関数: ユーザーロール取得
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM hn_pi_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ヘルパー関数: ユーザーが管理者かチェック
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' FROM hn_pi_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ヘルパー関数: ユーザーが編集者以上かチェック
-- ============================================================

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('editor', 'admin') FROM hn_pi_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 完了メッセージ
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS ポリシーの設定が完了しました！';
  RAISE NOTICE '次のステップ: Storage バケットとポリシーを設定してください';
  RAISE NOTICE 'ドキュメント: docs/DATABASE_SETUP.md の「ステップ 4」を参照';
END $$;
