# Skill: 認証セットアップ (Better Auth + Google OAuth)

## 概要
Better Auth を使って Google OAuth 認証を構築する。

## 前提
- 02-setup-database が完了していること
- Google Cloud Console でプロジェクトを作成済みであること

## 手順

### 1. Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「認証情報」→「OAuth 2.0 クライアントID」を作成
3. アプリケーションの種類: 「ウェブアプリケーション」
4. 承認済みのリダイレクトURI:
   - 開発: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://your-domain.com/api/auth/callback/google`
5. クライアントIDとシークレットを `.env.local` に設定

### 2. Better Auth サーバー設定

`src/lib/auth.ts`:
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
```

### 3. Better Auth クライアント設定

`src/lib/auth-client.ts`:
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

### 4. API ルートハンドラー

`src/app/api/auth/[...all]/route.ts`:
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 5. ミドルウェア (オプション)

`src/middleware.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthPage = request.nextUrl.pathname.startsWith("/sign-");
  const isProtectedPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
```

### 6. 環境変数に追加

`.env.local` に以下を追記（まだ未設定の場合）:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 7. サインインページの作成

`src/app/(auth)/sign-in/page.tsx`:
```tsx
"use client";

import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">
        <h1 className="text-2xl font-bold text-center">ログイン</h1>
        <button
          onClick={() => signIn.social({ provider: "google", callbackURL: "/dashboard" })}
          className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            {/* Google icon SVG */}
          </svg>
          Googleでログイン
        </button>
      </div>
    </div>
  );
}
```

## 完了条件
- `/api/auth/callback/google` にアクセスできる
- Google ログインフローが動作する
- ログイン後にセッションCookieが設定される
- ミドルウェアで保護ページへの未認証アクセスがリダイレクトされる
