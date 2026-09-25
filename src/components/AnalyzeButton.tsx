"use client";

import { useState, useTransition } from "react";
import { analyzeTicket } from "@/app/actions";

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

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-60"
      >
        {isPending ? "Аналізую…" : analyzed ? "Повторити аналіз" : "Аналізувати (AI)"}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
