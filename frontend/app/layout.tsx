import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predictions",
  description: "Telegram sports predictions MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

