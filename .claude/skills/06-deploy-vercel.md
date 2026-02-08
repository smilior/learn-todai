# Skill: Vercel デプロイ

## 概要
アプリケーションを Vercel にデプロイする。

## 前提
- 01〜05 のスキルがすべて完了していること
- Vercel アカウントがあること
- GitHub リポジトリにプッシュ済みであること

## 手順

### 1. Git リポジトリの初期化・プッシュ

```bash
git init
git add .
git commit -m "Initial commit: learn-todai base app"
git remote add origin https://github.com/<username>/learn-todai.git
git push -u origin main
```

### 2. Vercel プロジェクトの作成

```bash
npx vercel link
# または Vercel ダッシュボードから GitHub リポジトリをインポート
```

### 3. 環境変数の設定

Vercel ダッシュボードまたは CLI で設定:
```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_AUTH_TOKEN production
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_URL production    # https://your-domain.vercel.app
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add NEXT_PUBLIC_BETTER_AUTH_URL production
```

**重要**: `BETTER_AUTH_URL` と `NEXT_PUBLIC_BETTER_AUTH_URL` は本番ドメインに設定すること。

### 4. Google OAuth リダイレクトURIの更新

Google Cloud Console で、本番URLを承認済みリダイレクトURIに追加:
```
https://your-domain.vercel.app/api/auth/callback/google
```

### 5. ビルド確認

```bash
npm run build
```

エラーがないことを確認。

### 6. デプロイ

```bash
vercel deploy --prod
# または git push で自動デプロイ
```

### 7. デプロイ後の確認

- トップページが表示される
- Google ログインが動作する
- ダッシュボードに講義データが表示される
- 進捗の更新が保存される

## vercel.json (必要な場合)

```json
{
  "framework": "nextjs"
}
```

通常は不要（Next.js は自動検出される）。

## トラブルシューティング

- **ビルドエラー**: `npm run build` をローカルで確認
- **認証エラー**: `BETTER_AUTH_URL` が正しいか確認
- **DB接続エラー**: Turso のトークンが有効か確認（`turso db tokens create learn-todai`）
- **Google OAuth エラー**: リダイレクトURIが本番URLと一致しているか確認

## 完了条件
- Vercel にデプロイされている
- 本番URLでアプリが動作する
- Google ログインが本番環境で動作する
- データベースに正常に接続できる
