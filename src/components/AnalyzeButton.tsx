"use client";

import { useState, useTransition } from "react";
import { analyzeTicket } from "@/app/actions";

const primaryClass =
  "inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 " +
  "hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20";

const subtleClass =
  "inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-xs font-medium text-slate-500 " +
  "hover:text-slate-800 hover:underline dark:text-slate-300 dark:hover:text-white";

export default function AnalyzeButton({
  ticketId,
  analyzed,
}: {
  ticketId: number;
  analyzed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await analyzeTicket(ticketId);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  const idleLabel = analyzed ? "Повторити аналіз" : "✨ Аналізувати (AI)";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        className={`${analyzed ? subtleClass : primaryClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {isPending && (
          <span
            aria-hidden="true"
            className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {isPending ? "Аналізую…" : idleLabel}
      </button>
      <p aria-live="polite" className="text-right text-xs text-red-600 dark:text-red-400">
        <span className="sr-only">{isPending ? "Аналізую…" : ""}</span>
        {error}
      </p>
    </div>
  );
}
