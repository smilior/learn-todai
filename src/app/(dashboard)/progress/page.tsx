import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { BarChart3, CheckCircle, BookOpen, Circle } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courses, chapters, lectures, userProgress } from "@/db/schema";
import { CourseProgressChart } from "@/components/progress-charts";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const auth = getAuth();
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData?.user) {
    redirect("/sign-in");
  }

  const db = getDb();
  const userId = sessionData.user.id;

  // Fetch all data in parallel
  const [allCourses, allChapters, allLectures, progress] = await Promise.all([
    db.select().from(courses).orderBy(courses.order),
    db.select().from(chapters),
    db.select().from(lectures).orderBy(lectures.order),
    db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true))),
  ]);

  // Build lookup sets
  const completedLectureIds = new Set(progress.map((p) => p.lectureId));

  // KPI calculations
  const totalLectures = allLectures.length;
  const completedLectures = progress.length;
  const overallRate = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  // Chapter completion: a chapter is complete if all its lectures are completed
  const chapterLectureMap = new Map<string, string[]>();
  for (const lecture of allLectures) {
    const list = chapterLectureMap.get(lecture.chapterId) ?? [];
    list.push(lecture.id);
    chapterLectureMap.set(lecture.chapterId, list);
  }
  const completedChapters = allChapters.filter((ch) => {
    const chLectures = chapterLectureMap.get(ch.id) ?? [];
    return chLectures.length > 0 && chLectures.every((id) => completedLectureIds.has(id));
  }).length;

  // Per-course data for chart
  const courseChartData = allCourses.map((course) => {
    const courseLectures = allLectures.filter((l) => l.courseId === course.id);
    const courseCompleted = courseLectures.filter((l) => completedLectureIds.has(l.id)).length;
    const rate = courseLectures.length > 0 ? Math.round((courseCompleted / courseLectures.length) * 100) : 0;
    return {
      name: course.title.length > 25 ? course.title.slice(0, 25) + "..." : course.title,
      completionRate: rate,
      completed: courseCompleted,
      total: courseLectures.length,
    };
  });

  // Group lectures by course -> chapter
  type GroupedChapter = {
    chapter: typeof allChapters[number];
    lectures: (typeof allLectures[number] & { completed: boolean })[];
  };
  type GroupedCourse = {
    course: typeof allCourses[number];
    chapters: GroupedChapter[];
  };
  const grouped: GroupedCourse[] = allCourses.map((course) => {
    const courseChapters = allChapters
      .filter((ch) => ch.courseId === course.id)
      .sort((a, b) => a.number - b.number);
    return {
      course,
      chapters: courseChapters.map((ch) => ({
        chapter: ch,
        lectures: allLectures
          .filter((l) => l.chapterId === ch.id)
          .map((l) => ({ ...l, completed: completedLectureIds.has(l.id) })),
      })),
    };
  });

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1
          className="text-2xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          学習進捗
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          全コースの学習進捗を確認できます
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={<BarChart3 size={20} className="text-[var(--color-primary)]" />}
          label="全体完了率"
          value={`${overallRate}%`}
        />
        <KpiCard
          icon={<CheckCircle size={20} className="text-[var(--color-success)]" />}
          label="完了講義数"
          value={`${completedLectures} / ${totalLectures}`}
        />
        <KpiCard
          icon={<BookOpen size={20} className="text-[var(--color-primary)]" />}
          label="完了チャプター数"
          value={`${completedChapters} / ${allChapters.length}`}
        />
      </div>

      {/* Chart Section */}
      <div
        className="rounded-lg bg-[var(--color-surface)] p-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: 8 }}
      >
        <h2
          className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          コース別完了率
        </h2>
        <CourseProgressChart data={courseChartData} />
      </div>

      {/* Lecture Table grouped by course and chapter */}
      <div className="space-y-6">
        <h2
          className="text-lg font-semibold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          全講義一覧
        </h2>
        {grouped.map(({ course, chapters }) => (
          <div
            key={course.id}
            className="overflow-hidden rounded-lg bg-[var(--color-surface)]"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: 8 }}
          >
            <div className="border-b border-[var(--color-border)] bg-[var(--color-primary)]/5 px-4 py-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {course.title}
              </h3>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {chapters.map(({ chapter, lectures }) => (
                <div key={chapter.id}>
                  <div className="bg-[var(--background)] px-4 py-2">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      第{chapter.number}章: {chapter.title}
                    </span>
                  </div>
                  <ul className="divide-y divide-[var(--color-border)]">
                    {lectures.map((lecture) => (
                      <li
                        key={lecture.id}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        {lecture.completed ? (
                          <CheckCircle
                            size={16}
                            className="shrink-0 text-[var(--color-success)]"
                          />
                        ) : (
                          <Circle
                            size={16}
                            className="shrink-0 text-[var(--color-text-secondary)]/40"
                          />
                        )}
                        <span
                          className={`text-sm ${
                            lecture.completed
                              ? "text-[var(--color-text-secondary)]"
                              : "text-[var(--color-text-primary)]"
                          }`}
                        >
                          {lecture.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-lg bg-[var(--color-surface)] p-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: 8 }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</p>
        <p
          className="mt-0.5 text-xl font-bold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
