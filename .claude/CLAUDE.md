# learn-todai

東大OCW「統計データ解析 I」の学習進捗管理アプリ。

## 技術スタック
- **Framework**: Next.js (App Router, TypeScript, Tailwind CSS)
- **Auth**: Better Auth + Google OAuth
- **Database**: Turso (libSQL) + Drizzle ORM
- **Deploy**: Vercel

## スキル (構築手順)
`.claude/skills/` 配下に番号順で構築スキルを配置:

1. `01-init-project.md` - Next.js プロジェクト初期化
2. `02-setup-database.md` - Turso + Drizzle セットアップ
3. `03-setup-auth.md` - Better Auth + Google OAuth 認証
4. `04-seed-lectures.md` - lectures.json からのデータ投入
5. `05-build-pages.md` - ページ構築 (ダッシュボード、講義一覧、進捗管理)
6. `06-deploy-vercel.md` - Vercel デプロイ

## コマンド
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run db:generate  # マイグレーションファイル生成
npm run db:migrate   # マイグレーション実行
npm run db:push      # スキーマをDBに直接反映 (dev用)
npm run db:studio    # Drizzle Studio (DB GUI)
npm run db:seed      # 講義データのシード
```

## データ
- `lectures.json` - 東大OCW 統計データ解析 I の全113講義データ (13チャプター)
