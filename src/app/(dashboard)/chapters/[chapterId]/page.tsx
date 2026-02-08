import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courses, chapters, lectures, userProgress } from "@/db/schema";
import { LectureCheckbox } from "@/components/lecture-checkbox";
import { ArrowLeft, BookOpen, StickyNote } from "lucide-react";
import Link from "next/link";

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;

  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const db = getDb();

  // Fetch chapter
  const chapter = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, chapterId))
    .get();

  if (!chapter) {
    redirect("/dashboard");
  }

  // Fetch course for breadcrumb
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, chapter.courseId))
    .get();

  // Fetch lectures for this chapter
  const chapterLectures = await db
    .select()
    .from(lectures)
    .where(eq(lectures.chapterId, chapterId))
    .orderBy(lectures.order);

  // Fetch user progress
  const progress = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, session.user.id));

  const progressMap = new Map(
    progress.map((p) => [p.lectureId, p.completed])
  );

  const completedCount = chapterLectures.filter(
    (l) => progressMap.get(l.id) === true
  ).length;
  const totalCount = chapterLectures.length;
  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back link */}
      <div>
        <Link
          href={course ? `/courses/${course.id}` : "/dashboard"}
          className="mb-3 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} />
          {course ? course.title : "ダッシュボード"}に戻る
        </Link>

        {/* Chapter header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
            <BookOpen size={20} className="text-[var(--color-primary)]" />
          </div>
          <div className="flex-1">
            <h1
              className="text-xl font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              第{chapter.number}章: {chapter.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              {course?.instructor && <span>{course.instructor}</span>}
              <span>
                {completedCount} / {totalCount} 講義完了
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>チャプターの進捗</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percent}%`,
                backgroundColor: "var(--color-success)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Lecture list */}
      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            講義一覧
          </h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]/50">
          {chapterLectures.map((lecture) => (
            <LectureCheckbox
              key={lecture.id}
              lectureId={lecture.id}
              initialCompleted={progressMap.get(lecture.id) === true}
              lectureTitle={lecture.title}
              lectureUrl={lecture.url}
            />
          ))}
        </div>
      </div>

      {/* Lecture notes area (UI only, future use) */}
      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <StickyNote size={16} className="text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            講義メモ
          </h2>
        </div>
        <div className="p-4">
          <textarea
            placeholder="このチャプターに関するメモを入力..."
            disabled
            className="w-full resize-y rounded-md border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/60 focus:border-[var(--color-primary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            rows={4}
          />
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            メモ機能は今後実装予定です
          </p>
        </div>
      </div>
    </div>
  );
}
