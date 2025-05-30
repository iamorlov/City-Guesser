import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "City Guesser",
  keywords: [
    "city guesser",
    "geography game",
    "guess the city",
    "AI hints",
    "Grok AI",
    "geography quiz",
    "city trivia",
    "world cities",
    "geography challenge",
    "learn geography",
    "city trivia game",
    "guessing game",
    "interactive quiz",
    "educational game",
    "fun geography game",
    "city exploration",
    "world landmarks",
    "city landmarks",
    "geography learning",
    "city facts",
    "geography education",
  ],
  authors: [
    {
      name: "Vadym Orlov",
      url: "https://iamorlov.com",
    },
  ],
  creator: "Vadym Orlov",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
