import type { Ticket } from "@/db/schema";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Kyiv",
});

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="rounded-lg border border-zinc-200 p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">{ticket.customerName}</h3>
        <time dateTime={ticket.createdAt.toISOString()} className="text-sm text-zinc-500">
          {dateFormatter.format(ticket.createdAt)}
        </time>
      </header>
      <p className="mt-2 whitespace-pre-line break-words">{ticket.message}</p>
    </article>
  );
}
