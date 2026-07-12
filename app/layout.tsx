import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evolution of Us — Zero Start",
  description: "Turn-based realistic settlement and family survival prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
