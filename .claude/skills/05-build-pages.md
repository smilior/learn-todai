# Skill: ベースページの構築

## 概要
ダッシュボード、講義一覧、講義詳細ページを構築する。

## 前提
- 01〜04 のスキルがすべて完了していること

## 手順

### 1. レイアウトコンポーネント

`src/app/layout.tsx`:
- フォント設定 (Noto Sans JP 推奨)
- メタデータ設定 (title: "統計データ解析 I - 学習プラットフォーム")
- グローバルCSS

`src/components/header.tsx`:
- ロゴ / サイト名
- ナビゲーション
- ユーザーアバター + ログアウトボタン (認証済みの場合)

### 2. トップページ（ランディング）

`src/app/page.tsx`:
- コース概要の表示
- 「学習を始める」ボタン → サインインまたはダッシュボードへ
- Server Component として実装

### 3. ダッシュボードページ

`src/app/(dashboard)/dashboard/page.tsx`:
- 認証必須 (ミドルウェアで保護)
- 全体の進捗率を表示
- チャプター一覧をカード形式で表示
- 各チャプターの完了数/全講義数を表示

```typescript
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { chapters, lectures, userProgress } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // チャプター一覧 + 進捗データ取得
  const chaptersData = await db.select().from(chapters);
  // ... 進捗クエリ
}
```

### 4. チャプター詳細ページ

`src/app/(dashboard)/chapters/[chapterId]/page.tsx`:
- そのチャプターの全講義一覧
- 各講義の完了状態をチェックマークで表示
- 講義をクリックで外部URL（東大OCW）に遷移
- 「完了にする」ボタン

### 5. 進捗更新 Server Action

`src/app/actions/progress.ts`:
```typescript
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userProgress } from "@/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function toggleLectureComplete(lectureId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const existing = await db.query.userProgress.findFirst({
    where: and(
      eq(userProgress.userId, session.user.id),
      eq(userProgress.lectureId, lectureId),
    ),
  });

  if (existing) {
    await db.update(userProgress)
      .set({
        completed: !existing.completed,
        completedAt: !existing.completed ? new Date() : null,
      })
      .where(eq(userProgress.id, existing.id));
  } else {
    await db.insert(userProgress).values({
      id: nanoid(),
      userId: session.user.id,
      lectureId,
      completed: true,
      completedAt: new Date(),
    });
  }

  // revalidatePath で再描画
}
```

### 6. スタイリング

- Tailwind CSS でレスポンシブ対応
- ダークモード対応 (`dark:` プレフィックス)
- 進捗バーには `w-[${percentage}%]` 形式でなく、style属性で動的幅を指定

## 完了条件
- ダッシュボードにチャプター一覧と進捗が表示される
- チャプター詳細ページに講義一覧が表示される
- 「完了にする」で進捗が更新される
- 未認証ユーザーはサインインページにリダイレクトされる
- モバイルでも適切に表示される
