import type { Ticket } from "@/db/schema";
import AnalyzeButton from "@/components/AnalyzeButton";
import CopyButton from "@/components/CopyButton";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Kyiv",
});

type Priority = NonNullable<Ticket["priority"]>;
type Category = NonNullable<Ticket["category"]>;

const PRIORITY: Record<Priority, { label: string; className: string }> = {
  low: {
    label: "Низький",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  medium: {
    label: "Середній",
    className:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  },
  high: {
    label: "Високий",
    className:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  },
};

const CATEGORY_LABELS: Record<Category, string> = {
  payment: "Оплата",
  delivery: "Доставка",
  complaint: "Скарга",
  other: "Інше",
};

const badgeClass =
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const { analyzedAt } = ticket;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="min-w-0 break-words font-semibold">{ticket.customerName}</h3>
        <time
          dateTime={ticket.createdAt.toISOString()}
          className="text-xs text-slate-500 dark:text-slate-300"
        >
          {dateFormatter.format(ticket.createdAt)}
        </time>
      </header>

      <p className="mt-2 whitespace-pre-line break-words text-base leading-relaxed text-slate-700 dark:text-slate-200">
        {ticket.message}
      </p>

      {analyzedAt === null ? (
        <div className="mt-4 flex justify-end">
          <AnalyzeButton ticketId={ticket.id} analyzed={false} />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {ticket.priority && (
              <span className={`${badgeClass} ${PRIORITY[ticket.priority].className}`}>
                <span className="sr-only">Пріоритет: </span>
                {PRIORITY[ticket.priority].label}
              </span>
            )}
            {ticket.category && (
              <span
                className={`${badgeClass} bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20`}
              >
                <span className="sr-only">Категорія: </span>
                {CATEGORY_LABELS[ticket.category]}
              </span>
            )}
          </div>

          {ticket.summary && (
            <p className="break-words text-base text-slate-800 dark:text-slate-200">{ticket.summary}</p>
          )}

          {ticket.draftReply && (
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Чернетка відповіді
                </h4>
                <CopyButton text={ticket.draftReply} />
              </div>
              <p className="whitespace-pre-line break-words text-base leading-relaxed text-slate-800 dark:text-slate-200">
                {ticket.draftReply}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="py-1 text-xs text-slate-500 dark:text-slate-300">
              Проаналізовано:{" "}
              <time dateTime={analyzedAt.toISOString()}>{dateFormatter.format(analyzedAt)}</time>
            </p>
            <AnalyzeButton ticketId={ticket.id} analyzed />
          </div>
        </div>
      )}
    </article>
  );
}
