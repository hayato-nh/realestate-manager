-- ============================================================
-- デバッグ用クエリ - 物件データの確認
-- ============================================================

-- 1. すべての物件を確認（RLSをバイパス）
SELECT
  id,
  name,
  status,
  created_by,
  deleted_at,
  created_at
FROM hn_pi_properties
ORDER BY created_at DESC;

-- 2. ステータス別の件数
SELECT
  status,
  COUNT(*) as count
FROM hn_pi_properties
WHERE deleted_at IS NULL
GROUP BY status;

-- 3. あなたのUser IDを確認
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- 4. あなたが作成した物件を確認
-- ↓ このクエリの前に、上記の「3」で取得したUser IDを確認してください
-- SELECT * FROM hn_pi_properties WHERE created_by = 'YOUR_USER_ID_HERE';

-- 5. 下書き物件を確認
SELECT
  id,
  name,
  status,
  created_by
FROM hn_pi_properties
WHERE status = 'draft' AND deleted_at IS NULL;

-- 6. RLSポリシーの確認
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'hn_pi_properties'
ORDER BY policyname;

-- 7. 実際のアプリケーションと同じクエリを実行
-- （RLSが適用される）
SELECT
  id,
  name,
  status,
  created_by,
  created_at
FROM hn_pi_properties
ORDER BY created_at DESC;
