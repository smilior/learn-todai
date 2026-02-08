# Skill: データベースセットアップ (Turso + Drizzle)

## 概要
Turso データベースを作成し、Drizzle ORM でスキーマを定義・マイグレーションする。

## 手順

### 1. Turso データベースの作成 (CLI)

```bash
# Turso CLI がなければインストール
brew install tursodatabase/tap/turso
turso auth login

# データベース作成
turso db create learn-todai

# 接続情報取得
turso db show learn-todai --url
turso db tokens create learn-todai
```

取得した値を `.env.local` の `DATABASE_URL` と `DATABASE_AUTH_TOKEN` に設定。

### 2. Drizzle DB クライアントの作成

`src/lib/db.ts`:
```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

### 3. スキーマ定義

`src/db/schema.ts`:
```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Better Auth が必要とするテーブル (auth のスキーマ生成で自動作成可能)
// ここにはアプリ固有のテーブルを定義

export const chapters = sqliteTable("chapters", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
});

export const lectures = sqliteTable("lectures", {
  id: text("id").primaryKey(),       // "1-1" 形式
  chapterId: integer("chapter_id").notNull().references(() => chapters.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull(),
});

export const userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey(),       // nanoid等で生成
  userId: text("user_id").notNull(), // Better Auth の user.id
  lectureId: text("lecture_id").notNull().references(() => lectures.id),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  notes: text("notes"),
});
```

### 4. Better Auth のスキーマを生成

```bash
npx @better-auth/cli generate --config src/lib/auth.ts --output src/db/auth-schema.ts
```

生成された `auth-schema.ts` を `schema.ts` に統合またはインポート。

### 5. マイグレーション実行

```bash
# マイグレーションファイル生成
npx drizzle-kit generate

# マイグレーション実行
npx drizzle-kit migrate
```

### 6. package.json にスクリプト追加

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## 完了条件
- Turso にデータベースが作成されている
- `.env.local` に接続情報が設定されている
- `src/db/schema.ts` にテーブル定義がある
- `npx drizzle-kit push` が正常に完了する
- `npx drizzle-kit studio` でテーブルが確認できる
