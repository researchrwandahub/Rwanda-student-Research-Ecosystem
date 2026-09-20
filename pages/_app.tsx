import type { AppProps } from "next/app";
import { Source_Serif_4, Inter } from "next/font/google";
import { LanguageProvider } from "../context/LanguageContext";
import "../styles/globals.css";

// Two families, clearly distinct roles: a serif for headlines/editorial
// content (academic authority) and a sans for everything functional (body
// copy, forms, data). next/font self-hosts these at build time — no
// external font request at runtime, and no layout shift.
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${serif.variable} ${sans.variable} font-sans`}>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </main>
  );
}
