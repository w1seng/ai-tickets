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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">AI-обробка звернень</h1>

      <section>
        <TicketForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Звернення ({allTickets.length})</h2>
        {allTickets.length === 0 ? (
          <p className="text-zinc-500">Звернень поки немає</p>
        ) : (
          <ul className="flex flex-col gap-3">
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
