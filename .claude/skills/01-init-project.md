# Skill: プロジェクト初期化

## 概要
Next.js App Router + TypeScript + Tailwind CSS でプロジェクトを初期化する。

## 手順

### 1. Next.js プロジェクト作成
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm
```
> 既にファイルがある場合は `lectures.json` を退避してから実行し、完了後に戻す。

### 2. 依存パッケージのインストール

```bash
# Auth
npm install better-auth

# Database
npm install @libsql/client drizzle-orm
npm install -D drizzle-kit

# UI (shadcn/ui 用)
npm install class-variance-authority clsx tailwind-merge lucide-react
```

### 3. 基本ディレクトリ構成の作成

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/[...all]/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts           # Better Auth サーバー設定
│   ├── auth-client.ts    # Better Auth クライアント
│   ├── db.ts             # Drizzle + Turso クライアント
│   └── utils.ts          # ユーティリティ (cn関数など)
├── db/
│   └── schema.ts         # Drizzle スキーマ定義
└── components/
    ├── ui/               # 共通UIコンポーネント
    └── auth/             # 認証関連コンポーネント
```

### 4. 環境変数ファイルの作成

`.env.local` を作成:
```env
# Turso Database
DATABASE_URL=
DATABASE_AUTH_TOKEN=

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=  # openssl rand -base64 32 で生成

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`.env.example` を同じキー（値なし）で作成。

### 5. .gitignore に追記
```
.env.local
.env*.local
```

### 6. drizzle.config.ts を作成

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
```

### 7. lectures.json をプロジェクトルートまたは `src/data/` に配置

## 完了条件
- `npm run dev` でエラーなく起動する
- ディレクトリ構造が上記の通りになっている
- `.env.local` と `.env.example` が存在する
- `drizzle.config.ts` が存在する
