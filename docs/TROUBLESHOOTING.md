# トラブルシューティングガイド

## 目次
1. [RLS 無限再帰エラー](#rls-無限再帰エラー)
2. [認証エラー](#認証エラー)
3. [データベース接続エラー](#データベース接続エラー)
4. [環境変数エラー](#環境変数エラー)
5. [その他のエラー](#その他のエラー)

---

## RLS 無限再帰エラー

### エラーメッセージ
```
infinite recursion detected in policy for relation "hn_pi_profiles"
```

### 原因
Row Level Security (RLS) ポリシーが自分自身を参照しているため、無限ループが発生しています。

具体的には、以下のようなポリシーが問題です：
```sql
-- 問題のあるポリシー（例）
CREATE POLICY "Admins can view all profiles"
ON hn_pi_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM hn_pi_profiles  -- ← ここで自分自身を参照
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

このポリシーは `hn_pi_profiles` テーブルを参照しようとしますが、そのテーブル自体がRLSで保護されているため、再度同じポリシーが評価され、無限ループになります。

### 解決方法

**ステップ 1**: Supabase SQL Editor で以下のSQLファイルを実行

`docs/migrations/03_fix_rls_policies.sql` の内容をコピー＆ペーストして実行してください。

このファイルは：
1. 既存の問題のあるポリシーをすべて削除
2. 無限再帰を引き起こさない新しいポリシーを作成
3. 管理者判定関数を安全に実装（SECURITY DEFINER）

**ステップ 2**: ブラウザをリフレッシュしてテスト

`http://localhost:3000/test` にアクセスして、エラーが解消されたか確認してください。

### 重要な変更点

修正後のポリシーでは：

1. **基本ポリシー**: ユーザーは自分のデータのみアクセス
```sql
CREATE POLICY "Users can view own profile"
ON hn_pi_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());  -- シンプル、再帰なし
```

2. **管理者機能**: SECURITY DEFINER 関数を使用
```sql
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM hn_pi_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- ← これが重要
```

`SECURITY DEFINER` により、関数は RLS を**バイパス**して実行されるため、無限再帰が発生しません。

---

## 認証エラー

### エラーメッセージ
```
Invalid login credentials
```

### 原因
- メールアドレスまたはパスワードが間違っている
- ユーザーが Supabase Auth に登録されていない

### 解決方法

**ステップ 1**: Supabase Dashboard でユーザーを確認

1. https://app.supabase.com/ にアクセス
2. プロジェクトを選択
3. **Authentication** → **Users** に移動
4. ユーザーが存在するか確認

**ステップ 2**: ユーザーが存在しない場合、作成

1. **Add user** をクリック
2. メールアドレスとパスワードを入力
3. **Create user** をクリック

**ステップ 3**: Email confirmation をスキップ（開発環境）

開発環境では、メール確認を無効化できます：

1. **Authentication** → **Settings** に移動
2. **Email Confirmation** を無効化

---

## データベース接続エラー

### エラーメッセージ
```
relation "hn_pi_properties" does not exist
```

### 原因
テーブルが作成されていない、またはマイグレーションが正しく実行されていない。

### 解決方法

**ステップ 1**: テーブルが存在するか確認

Supabase SQL Editor で以下を実行：
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'hn_pi_%';
```

**期待される結果**:
```
hn_pi_profiles
hn_pi_properties
hn_pi_property_images
hn_pi_property_amenities
hn_pi_favorites
hn_pi_saved_searches
hn_pi_view_history
```

**ステップ 2**: テーブルが存在しない場合、マイグレーションを実行

1. `docs/migrations/01_initial_schema.sql` を実行
2. `docs/migrations/03_fix_rls_policies.sql` を実行（02 は skip）

---

## プロフィールデータが空

### 症状
- ログインは成功するが、プロフィールデータが取得できない
- `hn_pi_profiles` テーブルにデータが入っていない

### 原因
新規ユーザー作成時の自動トリガーが動作していない、または既存ユーザーのプロフィールが未作成。

### 解決方法

**方法 1: トリガーの確認と再作成**

Supabase SQL Editor で以下を実行：
```sql
-- トリガーが存在するか確認
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

トリガーが存在しない場合、`docs/migrations/01_initial_schema.sql` を再実行してください。

**方法 2: 既存ユーザーのプロフィールを手動作成**

```sql
-- 現在ログインしているユーザーのIDを確認
SELECT id, email FROM auth.users;

-- プロフィールを手動作成
INSERT INTO hn_pi_profiles (id, email, full_name, role)
VALUES (
  'your-user-id-here',  -- ← 上記で確認したIDを入力
  'user@example.com',    -- ← メールアドレス
  'テストユーザー',      -- ← 名前（任意）
  'viewer'               -- ← ロール (viewer/editor/admin)
);
```

**方法 3: ユーザーを削除して再作成**

1. Supabase Dashboard の **Authentication** → **Users** でユーザーを削除
2. 再度ユーザーを作成
3. トリガーが自動的にプロフィールを作成します

---

## 環境変数エラー

### エラーメッセージ
```
Invalid API key
createClient is not defined
```

### 原因
`.env.local` ファイルが正しく設定されていない、または読み込まれていない。

### 解決方法

**ステップ 1**: `.env.local` ファイルの確認

ファイルがプロジェクトルートに存在するか確認：
```
1015app/
├── .env.local  ← ここにあるか確認
├── src/
├── package.json
└── ...
```

**ステップ 2**: 環境変数の内容を確認

`.env.local` の内容：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**ステップ 3**: Supabase Dashboard で正しい値を取得

1. https://app.supabase.com/ にアクセス
2. プロジェクトを選択
3. **Settings** → **API** に移動
4. 以下をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

**ステップ 4**: 開発サーバーを再起動

環境変数を変更した場合、必ず開発サーバーを再起動してください：
```bash
# Ctrl+C で停止
npm run dev
```

---

## RLS ポリシーでアクセスが拒否される

### エラーメッセージ
```
new row violates row-level security policy
permission denied for table hn_pi_properties
```

### 原因
RLS ポリシーが厳しすぎる、または適切に設定されていない。

### 解決方法

**一時的な解決策（開発環境のみ）**: RLS を無効化

```sql
-- 特定のテーブルの RLS を無効化（デバッグ用）
ALTER TABLE hn_pi_properties DISABLE ROW LEVEL SECURITY;

-- 問題解決後、必ず再度有効化
ALTER TABLE hn_pi_properties ENABLE ROW LEVEL SECURITY;
```

⚠️ **警告**: 本番環境では絶対に RLS を無効化しないでください。

**恒久的な解決策**: ポリシーを確認・修正

1. 現在のポリシーを確認：
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'hn_pi_properties';
```

2. 必要に応じて `docs/migrations/03_fix_rls_policies.sql` を再実行

---

## ログアウト後も認証が残る

### 症状
ログアウトしても `/test` ページにアクセスできる、またはログイン状態が残る。

### 原因
ブラウザのキャッシュまたは Cookie が残っている。

### 解決方法

**方法 1: ハードリフレッシュ**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**方法 2: Cookie を削除**
1. ブラウザの開発者ツールを開く（F12）
2. **Application** タブ → **Cookies** → `localhost`
3. すべての Cookie を削除

**方法 3: シークレットモードで開く**
新しいシークレットウィンドウでアプリを開いてテスト。

---

## その他のエラー

### TypeScript エラー

```
Module not found: Can't resolve '@/lib/supabase/client'
```

**解決方法**:
- `tsconfig.json` の `paths` 設定を確認
- 開発サーバーを再起動

### Next.js ビルドエラー

```
Error: Page "/test" is missing "use client" directive
```

**解決方法**:
- Server Component と Client Component を正しく分離
- `'use client'` ディレクティブを追加

### Supabase 接続タイムアウト

```
FetchError: request to https://xxx.supabase.co failed
```

**解決方法**:
1. インターネット接続を確認
2. Supabase プロジェクトがポーズされていないか確認（Dashboard で確認）
3. ファイアウォールが Supabase をブロックしていないか確認

---

## デバッグのヒント

### 1. ブラウザの開発者ツールを使用

**Console タブ**:
- JavaScript エラーを確認
- ネットワークリクエストを確認

**Network タブ**:
- Supabase への API リクエストを確認
- ステータスコード（200, 401, 403 など）を確認
- レスポンスの内容を確認

### 2. Supabase Logs を確認

Supabase Dashboard:
1. **Logs** → **API Logs** に移動
2. 失敗したリクエストを確認
3. エラーメッセージを確認

### 3. SQL クエリを直接実行してテスト

Supabase SQL Editor で直接クエリを実行：
```sql
-- プロフィールを直接取得
SELECT * FROM hn_pi_profiles WHERE id = 'your-user-id';

-- 物件を直接取得
SELECT * FROM hn_pi_properties LIMIT 5;
```

---

## サポート

問題が解決しない場合:

1. **ドキュメントを確認**:
   - `docs/DATABASE_SETUP.md`
   - `docs/PRD.md`
   - `CLAUDE.md`

2. **Supabase 公式ドキュメント**:
   - https://supabase.com/docs

3. **エラーメッセージを検索**:
   - Supabase Community: https://github.com/supabase/supabase/discussions
   - Stack Overflow

4. **ログを確認**:
   - ブラウザのコンソール
   - Next.js のターミナル出力
   - Supabase Dashboard の Logs
