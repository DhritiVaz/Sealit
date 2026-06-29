import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sealit — Build things that need to exist.",
  description:
    "A personalized feed of real unsolved problems — scraped from Reddit and HN, structured by AI, matched to your stack.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
