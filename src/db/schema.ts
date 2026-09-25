import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const categoryEnum = pgEnum("category", [
  "payment",
  "delivery",
  "complaint",
  "other",
]);

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
