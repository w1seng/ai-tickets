import type { Ticket } from "@/db/schema";
import AnalyzeButton from "@/components/AnalyzeButton";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Kyiv",
});

const PRIORITY_LABELS: Record<NonNullable<Ticket["priority"]>, string> = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
};

const CATEGORY_LABELS: Record<NonNullable<Ticket["category"]>, string> = {
  payment: "Оплата",
  delivery: "Доставка",
  complaint: "Скарга",
  other: "Інше",
};

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const analyzed = ticket.analyzedAt !== null;

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">{ticket.customerName}</h3>
        <time dateTime={ticket.createdAt.toISOString()} className="text-sm text-zinc-500">
          {dateFormatter.format(ticket.createdAt)}
        </time>
      </header>

      <p className="whitespace-pre-line break-words">{ticket.message}</p>

      {analyzed && (
        <section className="flex flex-col gap-2 rounded-md bg-zinc-50 p-3 text-sm">
          <dl className="flex flex-wrap gap-x-6 gap-y-1">
            {ticket.priority && (
              <div className="flex gap-1">
                <dt className="text-zinc-500">Пріоритет:</dt>
                <dd className="font-medium">{PRIORITY_LABELS[ticket.priority]}</dd>
              </div>
            )}
            {ticket.category && (
              <div className="flex gap-1">
                <dt className="text-zinc-500">Категорія:</dt>
                <dd className="font-medium">{CATEGORY_LABELS[ticket.category]}</dd>
              </div>
            )}
          </dl>
          {ticket.summary && (
            <div>
              <h4 className="text-zinc-500">Підсумок</h4>
              <p>{ticket.summary}</p>
            </div>
          )}
          {ticket.draftReply && (
            <div>
              <h4 className="text-zinc-500">Чернетка відповіді</h4>
              <p className="whitespace-pre-line break-words">{ticket.draftReply}</p>
            </div>
          )}
        </section>
      )}

      <AnalyzeButton ticketId={ticket.id} analyzed={analyzed} />
    </article>
  );
}
