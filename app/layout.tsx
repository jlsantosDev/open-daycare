import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { NewPostProvider } from "@/components/NewPostProvider/NewPostProvider";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenDayCare",
  description: "Guardería — feed de la sala",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <NewPostProvider>{children}</NewPostProvider>
      </body>
    </html>
  );
}
