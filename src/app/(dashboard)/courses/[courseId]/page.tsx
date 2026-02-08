import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courses, chapters, lectures, userProgress } from "@/db/schema";
import { LectureCheckbox } from "@/components/lecture-checkbox";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const db = getDb();

  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .get();

  if (!course) {
    redirect("/dashboard");
  }

  const courseChapters = await db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, courseId))
    .orderBy(chapters.number);

  const courseLectures = await db
    .select()
    .from(lectures)
    .where(eq(lectures.courseId, courseId))
    .orderBy(lectures.order);

  const progress = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, session.user.id));

  const progressMap = new Map(
    progress.map((p) => [p.lectureId, p.completed])
  );

  const totalLectures = courseLectures.length;
  const completedLectures = courseLectures.filter(
    (l) => progressMap.get(l.id) === true
  ).length;
  const overallPercent =
    totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="mb-3 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} />
          ダッシュボードに戻る
        </Link>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
            <BookOpen size={20} className="text-[var(--color-primary)]" />
          </div>
          <div className="flex-1">
            <h1
              className="text-xl font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {course.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              {course.instructor && <span>{course.instructor}</span>}
              <span>フェーズ {course.phase}</span>
              <span>
                {completedLectures} / {totalLectures} 講義完了
              </span>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>全体の進捗</span>
            <span>{overallPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${overallPercent}%`,
                backgroundColor: "var(--color-success)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        {courseChapters.map((chapter) => {
          const chapterLectures = courseLectures.filter(
            (l) => l.chapterId === chapter.id
          );
          const chapterCompleted = chapterLectures.filter(
            (l) => progressMap.get(l.id) === true
          ).length;
          const chapterTotal = chapterLectures.length;
          const chapterPercent =
            chapterTotal > 0
              ? Math.round((chapterCompleted / chapterTotal) * 100)
              : 0;

          return (
            <div
              key={chapter.id}
              className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              {/* Chapter header */}
              <div className="border-b border-[var(--color-border)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                    第{chapter.number}章: {chapter.title}
                  </h2>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {chapterCompleted}/{chapterTotal}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${chapterPercent}%`,
                      backgroundColor: "var(--color-success)",
                    }}
                  />
                </div>
              </div>

              {/* Lecture list */}
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
          );
        })}
      </div>
    </div>
  );
}
