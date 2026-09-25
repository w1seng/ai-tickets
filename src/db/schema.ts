import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const PRIORITIES = ["low", "medium", "high"] as const;

// Нові значення лише додаються: видалення значення enum зламало б наявні записи.
export const CATEGORIES = [
  "payment",
  "refund",
  "delivery",
  "order",
  "product",
  "technical",
  "complaint",
  "question",
  "feedback",
  "other",
] as const;

export const priorityEnum = pgEnum("priority", PRIORITIES);
export const categoryEnum = pgEnum("category", CATEGORIES);

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  priority: priorityEnum("priority"),
  category: categoryEnum("category"),
  summary: text("summary"),
  draftReply: text("draft_reply"),
  analyzedAt: timestamp("analyzed_at"),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Priority = (typeof PRIORITIES)[number];
export type Category = (typeof CATEGORIES)[number];
