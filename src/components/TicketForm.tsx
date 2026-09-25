"use client";

import { useActionState } from "react";
import { createTicket, type CreateTicketState } from "@/app/actions";

const initialState: CreateTicketState = { ok: false };

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 " +
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 " +
  "aria-invalid:border-red-500 " +
  "dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-400 " +
  "dark:focus:border-indigo-400 dark:focus:ring-indigo-400/40 dark:aria-invalid:border-red-400";

export default function TicketForm() {
  const [state, formAction, pending] = useActionState(createTicket, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="customerName" className="text-sm font-medium">
          Ім’я клієнта
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          autoComplete="off"
          maxLength={100}
          defaultValue={state.values?.customerName ?? ""}
          aria-invalid={Boolean(state.errors?.customerName)}
          aria-describedby={state.errors?.customerName ? "customerName-error" : undefined}
          className={fieldClass}
        />
        {state.errors?.customerName && (
          <p id="customerName-error" className="text-xs text-red-600 dark:text-red-400">
            {state.errors.customerName}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
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
          className={`${fieldClass} resize-y`}
        />
        {state.errors?.message && (
          <p id="message-error" className="text-xs text-red-600 dark:text-red-400">
            {state.errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p aria-live="polite" className="mr-auto text-xs text-red-600 dark:text-red-400">
          {state.errors?.form}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none dark:hover:bg-indigo-500"
        >
          {pending ? "Додаю…" : "Додати"}
        </button>
      </div>
    </form>
  );
}
