import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-обробка звернень",
  description: "Внутрішній інструмент служби підтримки",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
