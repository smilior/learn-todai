import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { BookOpen } from "lucide-react";

export default async function Home() {
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[var(--background)] px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-primary)]">
          <BookOpen size={28} className="text-white" />
        </div>
        <h1
          className="text-4xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          learn-todai
        </h1>
        <p className="max-w-md text-[var(--color-text-secondary)]">
          東大OCW「統計データ解析 I」の学習進捗を管理して、効率的に学びを進めましょう。
        </p>
      </div>
      <Link
        href="/sign-in"
        className="flex cursor-pointer items-center gap-2 rounded-md bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90"
      >
        ログインして始める
      </Link>
    </div>
  );
}
