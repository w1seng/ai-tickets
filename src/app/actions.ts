"use server";

import Anthropic from "@anthropic-ai/sdk";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { AnalysisError, analyzeMessage } from "@/lib/analyze";

const MAX_TICKETS = 200;
const ANALYZE_COOLDOWN_SECONDS = 10;

const ticketSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, { error: "Вкажіть ім’я клієнта" })
    .max(100, { error: "Ім’я не може бути довшим за 100 символів" }),
  message: z
    .string()
    .trim()
    .min(5, { error: "Текст звернення має містити щонайменше 5 символів" })
    .max(2000, { error: "Текст звернення не може бути довшим за 2000 символів" }),
});

type TicketInput = z.infer<typeof ticketSchema>;

export type CreateTicketState = {
  ok: boolean;
  errors?: Partial<Record<keyof TicketInput | "form", string>>;
  values?: TicketInput;
};

export async function createTicket(
  _prevState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const values: TicketInput = {
    customerName: String(formData.get("customerName") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = ticketSchema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      errors: {
        customerName: fieldErrors.customerName?.[0],
        message: fieldErrors.message?.[0],
      },
      values,
    };
  }

  try {
    if ((await db.$count(tickets)) >= MAX_TICKETS) {
      return {
        ok: false,
        errors: {
          form: `Досягнуто ліміту в ${MAX_TICKETS} звернень. Нові звернення тимчасово не приймаються.`,
        },
        values,
      };
    }
    await db.insert(tickets).values(parsed.data);
  } catch (error) {
    console.error("createTicket failed", error);
    return {
      ok: false,
      errors: { form: "Не вдалося зберегти звернення. Спробуйте ще раз." },
      values,
    };
  }

  revalidatePath("/");
  return { ok: true };
}

export type AnalyzeTicketResult = { ok: true } | { ok: false; error: string };

function analysisErrorMessage(error: unknown): string {
  if (error instanceof AnalysisError) {
    return "AI повернув некоректну відповідь. Спробуйте ще раз.";
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return "AI не відповів вчасно. Спробуйте ще раз.";
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "Немає з’єднання з AI-сервісом. Спробуйте пізніше.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "Забагато запитів до AI. Зачекайте хвилину і спробуйте ще раз.";
  }
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return "Помилка доступу до AI-сервісу. Перевірте налаштування ключа API.";
  }
  if (error instanceof Anthropic.APIError && error.status !== undefined && error.status >= 500) {
    return "AI-сервіс тимчасово недоступний. Спробуйте пізніше.";
  }
  return "Не вдалося проаналізувати звернення. Спробуйте ще раз.";
}

export async function analyzeTicket(id: number): Promise<AnalyzeTicketResult> {
  const parsedId = z.number().int().positive().safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: "Некоректний ідентифікатор звернення." };
  }

  try {
    const [ticket] = await db
      .select({
        customerName: tickets.customerName,
        message: tickets.message,
        // Порівняння в БД: analyzed_at записується через now() бази, тож годинник сервера не впливає.
        recentlyAnalyzed: sql<boolean>`coalesce(${tickets.analyzedAt} > now() - make_interval(secs => ${ANALYZE_COOLDOWN_SECONDS}), false)`,
      })
      .from(tickets)
      .where(eq(tickets.id, parsedId.data))
      .limit(1);

    if (!ticket) {
      return { ok: false, error: "Звернення не знайдено." };
    }
    if (ticket.recentlyAnalyzed) {
      return { ok: false, error: "Зачекайте кілька секунд перед повторним аналізом." };
    }

    const analysis = await analyzeMessage(ticket.customerName, ticket.message);

    await db
      .update(tickets)
      .set({
        priority: analysis.priority,
        category: analysis.category,
        summary: analysis.summary,
        draftReply: analysis.draftReply,
        analyzedAt: sql`now()`,
      })
      .where(eq(tickets.id, parsedId.data));
  } catch (error) {
    console.error(`analyzeTicket(${parsedId.data}) failed`, error);
    return { ok: false, error: analysisErrorMessage(error) };
  }

  revalidatePath("/");
  return { ok: true };
}
