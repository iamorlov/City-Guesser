import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.scss";
import { LocaleProvider } from "../i18n/LocaleProvider";

const montserratFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});


export const metadata: Metadata = {
  title: "City Guesser",
  description: "Test your geography knowledge! An AI-powered city guessing game with hints.",
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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#588157',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${montserratFont.variable} antialiased`}
      >
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
