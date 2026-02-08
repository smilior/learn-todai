import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courses, chapters, lectures, userProgress } from "@/db/schema";
import {
  BookOpen,
  CheckCircle,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const db = getDb();

  // Fetch all data in parallel
  const [allCourses, allChapters, allLectures, completedProgress] =
    await Promise.all([
      db.select().from(courses).orderBy(courses.order),
      db.select().from(chapters),
      db.select().from(lectures),
      db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, session.user.id),
            eq(userProgress.completed, true)
          )
        ),
    ]);

  const completedLectureIds = new Set(
    completedProgress.map((p) => p.lectureId)
  );

  // Build per-chapter stats
  const chapterStats = allChapters
    .map((chapter) => {
      const chapterLectures = allLectures.filter(
        (l) => l.chapterId === chapter.id
      );
      const completedCount = chapterLectures.filter((l) =>
        completedLectureIds.has(l.id)
      ).length;
      const totalCount = chapterLectures.length;
      const progressPercent =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const isComplete = totalCount > 0 && completedCount === totalCount;
      const course = allCourses.find((c) => c.id === chapter.courseId);

      return {
        ...chapter,
        courseTitle: course?.title ?? "",
        courseOrder: course?.order ?? 0,
        totalLectures: totalCount,
        completedLectures: completedCount,
        progressPercent,
        isComplete,
      };
    })
    .sort((a, b) => a.courseOrder - b.courseOrder || a.number - b.number);

  // KPI calculations
  const totalLectures = allLectures.length;
  const totalCompleted = completedLectureIds.size;
  const overallPercent =
    totalLectures > 0
      ? Math.round((totalCompleted / totalLectures) * 100)
      : 0;
  const completedChapters = chapterStats.filter((c) => c.isComplete).length;
  const totalChapters = allChapters.length;

  // Current chapter: the first incomplete chapter (by course order, then chapter number)
  const currentChapter = chapterStats.find((c) => !c.isComplete);
  const currentChapterLabel = currentChapter
    ? `第${currentChapter.number}章`
    : "全完了";

  const kpis = [
    {
      label: "全体進捗率",
      value: `${overallPercent}%`,
      icon: TrendingUp,
      color: "var(--color-primary)",
    },
    {
      label: "完了講義数",
      value: `${totalCompleted} / ${totalLectures}`,
      icon: CheckCircle,
      color: "var(--color-success)",
    },
    {
      label: "完了チャプター数",
      value: `${completedChapters} / ${totalChapters}`,
      icon: GraduationCap,
      color: "var(--color-secondary)",
    },
    {
      label: "現在のチャプター",
      value: currentChapterLabel,
      icon: BookOpen,
      color: "var(--color-warning)",
    },
  ];

  // Group chapters by course for display
  const courseGroups = allCourses.map((course) => ({
    ...course,
    chapters: chapterStats.filter((ch) => ch.courseId === course.id),
  }));

  return (
    <div>
      {/* Page heading */}
      <h1
        className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        ダッシュボード
      </h1>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5"
            style={{
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {kpi.label}
              </span>
              <kpi.icon size={20} style={{ color: kpi.color }} />
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chapter cards grouped by course */}
      {courseGroups.map((course) => (
        <div key={course.id} className="mb-8">
          <h2
            className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {course.title}
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {course.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/courses/${chapter.courseId}`}
                className="cursor-pointer bg-[var(--color-surface)] border border-[var(--color-border)] p-5 transition-shadow hover:shadow-md"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  display: "block",
                }}
              >
                {/* Chapter header */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-snug">
                    第{chapter.number}章: {chapter.title}
                  </h3>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{
                      backgroundColor: chapter.isComplete
                        ? "var(--color-success)"
                        : "var(--color-primary)",
                    }}
                  >
                    {chapter.isComplete ? "完了" : "進行中"}
                  </span>
                </div>

                {/* Lecture count */}
                <div className="mb-3 text-sm text-[var(--color-text-secondary)]">
                  {chapter.totalLectures} 講義
                </div>

                {/* Progress bar */}
                <div className="mb-1.5">
                  <div
                    className="h-2 w-full overflow-hidden bg-[var(--color-border)]"
                    style={{ borderRadius: 4 }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${chapter.progressPercent}%`,
                        backgroundColor: chapter.isComplete
                          ? "var(--color-success)"
                          : "var(--color-primary)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>

                {/* Progress text */}
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {chapter.completedLectures} / {chapter.totalLectures} 講義完了
                  <span
                    className="ml-2 font-semibold"
                    style={{
                      color: chapter.isComplete
                        ? "var(--color-success)"
                        : "var(--color-primary)",
                    }}
                  >
                    {chapter.progressPercent}%
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
