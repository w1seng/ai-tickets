"use client";

import { useActionState } from "react";
import { createTicket, type CreateTicketState } from "@/app/actions";

const initialState: CreateTicketState = { ok: false };

export default function TicketForm() {
  const [state, formAction, pending] = useActionState(createTicket, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="customerName" className="text-sm font-medium">
          Ім’я клієнта
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          maxLength={100}
          defaultValue={state.values?.customerName ?? ""}
          aria-invalid={Boolean(state.errors?.customerName)}
          aria-describedby={state.errors?.customerName ? "customerName-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        {state.errors?.customerName && (
          <p id="customerName-error" className="text-sm text-red-600">
            {state.errors.customerName}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium">
          Текст звернення
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={2000}
          defaultValue={state.values?.message ?? ""}
          aria-invalid={Boolean(state.errors?.message)}
          aria-describedby={state.errors?.message ? "message-error" : undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        {state.errors?.message && (
          <p id="message-error" className="text-sm text-red-600">
            {state.errors.message}
          </p>
        )}
      </div>

      {state.errors?.form && (
        <p className="text-sm text-red-600" role="alert">
          {state.errors.form}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {pending ? "Додаю…" : "Додати"}
        </button>
      </div>
    </form>
  );
}
