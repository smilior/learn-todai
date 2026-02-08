# Skill: 講義データのシード

## 概要
`lectures.json` のデータを Turso データベースに投入する。

## 前提
- 02-setup-database が完了していること

## 手順

### 1. シードスクリプトの作成

`src/db/seed.ts`:
```typescript
import { db } from "@/lib/db";
import { chapters, lectures } from "./schema";
import lectureData from "../../lectures.json";

async function seed() {
  console.log("Seeding database...");

  // チャプター投入
  for (const chapter of lectureData.chapters) {
    await db.insert(chapters).values({
      id: chapter.chapter,
      title: chapter.title,
    }).onConflictDoNothing();

    // 講義投入
    for (let i = 0; i < chapter.lectures.length; i++) {
      const lecture = chapter.lectures[i];
      await db.insert(lectures).values({
        id: lecture.id,
        chapterId: chapter.chapter,
        title: lecture.title,
        url: lecture.url,
        order: i + 1,
      }).onConflictDoNothing();
    }
  }

  console.log(`Seeded ${lectureData.chapters.length} chapters`);
  console.log(`Seeded ${lectureData.chapters.reduce((sum, c) => sum + c.lectures.length, 0)} lectures`);
}

seed().catch(console.error);
```

### 2. 実行用 tsconfig 調整

`tsconfig.json` の `compilerOptions` に `resolveJsonModule: true` を確認。

### 3. シード実行スクリプトを package.json に追加

```json
{
  "scripts": {
    "db:seed": "npx tsx src/db/seed.ts"
  }
}
```

### 4. 実行

```bash
npm run db:seed
```

### 5. 確認

```bash
npx drizzle-kit studio
```
で chapters テーブルと lectures テーブルにデータが入っていることを確認。

## 完了条件
- chapters テーブルに全チャプターが入っている
- lectures テーブルに全113講義が入っている
- `npm run db:seed` が冪等（重複実行してもエラーにならない）
