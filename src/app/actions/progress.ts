"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { userProgress } from "@/db/schema";

export async function toggleLectureComplete(lectureId: string) {
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("認証が必要です");
  }

  const db = getDb();
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.lectureId, lectureId)
      )
    )
    .get();

  if (!existing) {
    await db.insert(userProgress).values({
      id: crypto.randomUUID(),
      userId,
      lectureId,
      completed: true,
      completedAt: new Date(),
    });
  } else {
    const newCompleted = !existing.completed;
    await db
      .update(userProgress)
      .set({
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      })
      .where(eq(userProgress.id, existing.id));
  }

  revalidatePath("/courses");
  revalidatePath("/chapters");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}
