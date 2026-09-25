"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { tickets } from "@/db/schema";

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
