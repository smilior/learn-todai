import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 dark:bg-zinc-950">
      <h1 className="text-4xl font-bold">Hello World!</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        東大OCW 統計データ解析 I 学習進捗管理
      </p>
      <Link
        href="/sign-in"
        className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        ログイン
      </Link>
    </div>
  );
}
