import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import NavWrapper from "@/components/ui/NavWrapper";
import { ThemeScript } from "@/components/ui/ThemeScript";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import AuthListener from "@/components/AuthListener";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "WitnessChain — Dokumentasi Bukti Digital",
  description:
    "Platform dokumentasi bukti digital untuk korban penggusuran, sengketa lahan, dan pelanggaran hak warga Indonesia. Bantu menyusun berkas kasus untuk konsultasi LBH atau lembaga terkait.",
  keywords: [
    "documenter",
    "bukti digital",
    "hak asasi manusia",
    "LBH",
    "penggusuran",
    "sengketa lahan",
    "Indonesia",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon-512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} font-sans min-h-dvh text-[var(--text-primary)] bg-[var(--bg-secondary)]`}
      >
        <AuthProvider>
          <ThemeProvider>
            <AuthListener />
            <div className="min-h-dvh flex flex-col bg-[var(--bg-secondary)]">
              <NavWrapper>{children}</NavWrapper>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
