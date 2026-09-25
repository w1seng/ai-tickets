import { desc } from "drizzle-orm";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import TicketCard from "@/components/TicketCard";
import TicketForm from "@/components/TicketForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allTickets = await db
    .select()
    .from(tickets)
    .orderBy(desc(tickets.createdAt), desc(tickets.id));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI-обробка звернень</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          Внутрішній інструмент служби підтримки
        </p>
      </header>

      <section
        aria-labelledby="new-ticket-heading"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
      >
        <h2 id="new-ticket-heading" className="mb-4 text-base font-semibold">
          Нове звернення
        </h2>
        <TicketForm />
      </section>

      <section aria-labelledby="tickets-heading" className="flex flex-col gap-4">
        <h2 id="tickets-heading" className="text-base font-semibold">
          Звернення ({allTickets.length})
        </h2>
        {allTickets.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
            Звернень поки немає
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {allTickets.map((ticket) => (
              <li key={ticket.id}>
                <TicketCard ticket={ticket} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
