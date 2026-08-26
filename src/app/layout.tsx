import { ThemeProvider } from "@/context/ThemeContext";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Audiobooklm — Learn By Listening",
  description:
    "Upload your study content as JSON and learn through flashcards, Q&A, articles, notes, MCQ, and interview practice — all with text-to-speech support.",
  keywords: [
    "study",
    "flashcards",
    "text-to-speech",
    "learning",
    "interview prep",
  ],
  openGraph: {
    title: "Audiobooklm — Learn By Listening",
    description:
      "Your personal study companion with text-to-speech and spaced repetition.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
