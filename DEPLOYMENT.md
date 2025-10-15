# Vercelへのデプロイ手順

このアプリケーションをVercelにデプロイする手順を説明します。

## 前提条件

1. GitHubアカウントを持っていること
2. Vercelアカウントを持っていること（無料プランでOK）
3. Supabaseプロジェクトが作成済みであること

## ステップ1: GitHubリポジトリの作成

### 1.1 リポジトリの初期化（まだの場合）

```bash
git init
git add .
git commit -m "Initial commit: Real Estate Manager App"
```

### 1.2 GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. リポジトリ名を入力（例: `realestate-manager`）
3. "Private" を選択（機密情報を含むため）
4. "Create repository" をクリック

### 1.3 リモートリポジトリに接続

```bash
git remote add origin https://github.com/あなたのユーザー名/realestate-manager.git
git branch -M main
git push -u origin main
```

## ステップ2: Vercelでプロジェクトをインポート

### 2.1 Vercelにログイン

1. https://vercel.com にアクセス
2. "Dashboard" に移動
3. "Add New Project" をクリック

### 2.2 GitHubリポジトリをインポート

1. "Import Git Repository" を選択
2. 先ほど作成したリポジトリを選択
3. "Import" をクリック

## ステップ3: 環境変数の設定

### 3.1 必要な環境変数

Vercelのプロジェクト設定で、以下の環境変数を設定します：

**Settings → Environment Variables** に移動して以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3.2 Supabaseの認証情報を確認

1. Supabaseのダッシュボード（https://supabase.com/dashboard）にアクセス
2. プロジェクトを選択
3. **Settings → API** に移動
4. 以下をコピー：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3.3 環境変数の適用範囲

- **Production**: 本番環境用（必須）
- **Preview**: プレビュー環境用（オプション）
- **Development**: 開発環境用（ローカルでは .env.local を使用）

すべての環境にチェックを入れることを推奨します。

## ステップ4: デプロイ設定

### 4.1 ビルド設定（自動検出されます）

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

これらは自動的に設定されるため、変更不要です。

### 4.2 Node.jsバージョン

package.jsonに以下を追加することを推奨（既に含まれている場合はスキップ）：

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## ステップ5: デプロイ実行

1. "Deploy" ボタンをクリック
2. ビルドプロセスが開始されます（約2-5分）
3. デプロイが完了すると、URLが表示されます

例: `https://your-project-name.vercel.app`

## ステップ6: Supabaseの設定更新

### 6.1 認証リダイレクトURLの追加

1. Supabaseのダッシュボードに戻る
2. **Authentication → URL Configuration** に移動
3. **Site URL** に本番URLを設定：
   ```
   https://your-project-name.vercel.app
   ```

4. **Redirect URLs** に以下を追加：
   ```
   https://your-project-name.vercel.app/auth/callback
   https://your-project-name.vercel.app
   ```

## ステップ7: 動作確認

### 7.1 基本動作の確認

1. デプロイされたURLにアクセス
2. 以下の機能を確認：
   - ✅ トップページが表示される
   - ✅ 物件一覧ページが表示される
   - ✅ ログインができる
   - ✅ ダッシュボードにアクセスできる
   - ✅ PDFインポートが動作する

### 7.2 トラブルシューティング

#### エラー: "Invalid API credentials"

- Vercelの環境変数が正しく設定されているか確認
- Supabaseのプロジェクトが稼働しているか確認

#### エラー: "Authentication failed"

- SupabaseのRedirect URLsが正しく設定されているか確認
- VercelのデプロイURLとSupabaseの設定が一致しているか確認

#### PDFインポートが動作しない

- pdfjs-distライブラリが正しくインストールされているか確認
- Vercelのログを確認（Dashboard → Deployments → 最新のデプロイ → "View Function Logs"）

## ステップ8: カスタムドメインの設定（オプション）

### 8.1 独自ドメインの追加

1. Vercelのプロジェクト設定に移動
2. **Settings → Domains** を開く
3. "Add Domain" をクリック
4. ドメイン名を入力（例: `myapp.com`）
5. DNSレコードを設定（Vercelが指示を表示）

### 8.2 Supabaseの設定更新

カスタムドメインを設定した場合、Supabaseの認証URLも更新：

```
Site URL: https://myapp.com
Redirect URLs: https://myapp.com/auth/callback
```

## 継続的デプロイ（CI/CD）

GitHubにプッシュすると、自動的にVercelがデプロイを実行します：

```bash
git add .
git commit -m "Update feature"
git push origin main
```

- **main/master ブランチ** → 本番環境に自動デプロイ
- **その他のブランチ** → プレビュー環境に自動デプロイ

## セキュリティのベストプラクティス

1. ✅ `.env.local` をgit管理から除外（.gitignoreに含める）
2. ✅ Supabase Row Level Security (RLS) を有効化
3. ✅ 認証が必要なページにミドルウェアを設定
4. ✅ APIキーを公開リポジトリにコミットしない

## サポート

問題が発生した場合：

1. Vercelのログを確認: https://vercel.com/dashboard
2. Supabaseのログを確認: https://supabase.com/dashboard
3. Next.jsドキュメント: https://nextjs.org/docs
4. Vercelドキュメント: https://vercel.com/docs

## デプロイ完了！

これで、RealEstate Managerアプリケーションが本番環境で稼働しています！

本番URL: `https://your-project-name.vercel.app`
