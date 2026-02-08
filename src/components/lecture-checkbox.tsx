"use client";

import { useTransition } from "react";
import { ExternalLink, Check, Loader2 } from "lucide-react";
import { toggleLectureComplete } from "@/app/actions/progress";

interface LectureCheckboxProps {
  lectureId: string;
  initialCompleted: boolean;
  lectureTitle: string;
  lectureUrl: string;
}

export function LectureCheckbox({
  lectureId,
  initialCompleted,
  lectureTitle,
  lectureUrl,
}: LectureCheckboxProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleLectureComplete(lectureId);
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--color-border)]/30">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border border-[var(--color-border)] transition-colors disabled:opacity-50"
        style={
          initialCompleted
            ? { backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }
            : undefined
        }
        aria-label={initialCompleted ? `${lectureTitle} を未完了にする` : `${lectureTitle} を完了にする`}
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin text-[var(--color-text-secondary)]" />
        ) : initialCompleted ? (
          <Check size={12} className="text-white" />
        ) : null}
      </button>

      <span
        className={`flex-1 text-sm ${
          initialCompleted
            ? "text-[var(--color-text-secondary)] line-through"
            : "text-[var(--color-text-primary)]"
        }`}
      >
        {lectureTitle}
      </span>

      <a
        href={lectureUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
        aria-label={`${lectureTitle} を新しいタブで開く`}
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
