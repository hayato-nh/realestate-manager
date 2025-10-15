# 🚀 Vercel クイックデプロイガイド

## 📋 必要なもの

- [x] GitHubアカウント
- [x] Vercelアカウント（https://vercel.com で無料登録）
- [x] Supabaseプロジェクト

## ⚡ 5ステップでデプロイ

### 1️⃣ GitHubにプッシュ

```bash
# リポジトリ初期化（初回のみ）
git init
git add .
git commit -m "Initial commit"

# GitHubでリポジトリ作成後
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2️⃣ Vercelでインポート

1. https://vercel.com/new にアクセス
2. GitHubリポジトリを選択
3. "Import" をクリック

### 3️⃣ 環境変数を設定

**Settings → Environment Variables** で以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 💡 SupabaseのダッシュボードSettings → APIからコピー

### 4️⃣ デプロイ実行

"Deploy" ボタンをクリック → 2-3分待つ

### 5️⃣ Supabase設定を更新

**Authentication → URL Configuration** で：

```
Site URL: https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app
```

## ✅ 動作確認

- [ ] トップページが表示される
- [ ] ログインできる
- [ ] ダッシュボードにアクセスできる
- [ ] PDFインポートが動作する
- [ ] 物件一覧が表示される

## 🔄 更新方法

```bash
git add .
git commit -m "Update features"
git push
```

Vercelが自動的に再デプロイします！

## ⚠️ トラブルシューティング

### ログインできない
→ SupabaseのRedirect URLsを確認

### PDFインポートが失敗
→ Vercelのログを確認（Dashboard → Deployments → Function Logs）

### 環境変数が反映されない
→ Vercelで環境変数を再確認 → Redeploy

## 📚 詳細な手順

詳しい手順は `DEPLOYMENT.md` を参照してください。

## 🎉 完了！

本番URL: https://your-app.vercel.app
