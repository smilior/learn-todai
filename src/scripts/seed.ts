import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { courses, chapters, lectures } from "../db/schema";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

interface Lecture {
  id: string;
  title: string;
  url: string;
}

interface Chapter {
  chapter: number;
  title: string;
  lectures: Lecture[];
}

interface Course {
  course: string;
  course_url: string;
  phase: number;
  instructor: string;
  total_lectures: number;
  chapters: Chapter[];
}

interface LectureData {
  courses: Course[];
}

async function seed() {
  console.log("Seeding database...");

  const raw = fs.readFileSync(
    path.join(__dirname, "../../lectures.json"),
    "utf-8"
  );
  const data: LectureData = JSON.parse(raw);

  // Clear existing data (order matters due to FK)
  await db.delete(lectures).execute();
  await db.delete(chapters).execute();
  await db.delete(courses).execute();
  console.log("Cleared existing data.");

  let totalCourses = 0;
  let totalChapters = 0;
  let totalLectures = 0;

  for (let ci = 0; ci < data.courses.length; ci++) {
    const course = data.courses[ci];
    const courseId = `course-${ci + 1}`;

    await db.insert(courses).values({
      id: courseId,
      title: course.course,
      courseUrl: course.course_url,
      phase: course.phase,
      instructor: course.instructor || null,
      order: ci + 1,
    });
    totalCourses++;

    for (const chapter of course.chapters) {
      const chapterId = `${courseId}_ch-${chapter.chapter}`;

      await db.insert(chapters).values({
        id: chapterId,
        courseId,
        number: chapter.chapter,
        title: chapter.title,
      });
      totalChapters++;

      for (let li = 0; li < chapter.lectures.length; li++) {
        const lecture = chapter.lectures[li];
        const lectureId = `${courseId}_${lecture.id}`;

        await db.insert(lectures).values({
          id: lectureId,
          chapterId,
          courseId,
          title: lecture.title,
          url: lecture.url,
          order: li + 1,
        });
        totalLectures++;
      }
    }
  }

  // Verify
  const courseCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(courses);
  const chapterCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(chapters);
  const lectureCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(lectures);

  console.log(`Courses:  ${totalCourses} inserted (DB: ${courseCount[0].count})`);
  console.log(`Chapters: ${totalChapters} inserted (DB: ${chapterCount[0].count})`);
  console.log(`Lectures: ${totalLectures} inserted (DB: ${lectureCount[0].count})`);
  console.log("Done!");
}

seed().catch(console.error);
