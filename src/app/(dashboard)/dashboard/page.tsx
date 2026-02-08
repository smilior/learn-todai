"use client";

import { useSession, signOut } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Hello World!</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        ようこそ、{session?.user?.name ?? "ゲスト"} さん
      </p>
      <button
        onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/sign-in"; } } })}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        ログアウト
      </button>
    </div>
  );
}
