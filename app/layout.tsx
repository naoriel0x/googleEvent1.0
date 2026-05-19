import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'WitnessChain — Dokumentasi Bukti Digital',
  description:
    'Platform dokumentasi bukti digital untuk korban penggusuran, sengketa lahan, dan pelanggaran hak warga Indonesia. Buat dokumen profesional siap dibawa ke LBH atau Komnas HAM.',
  keywords: [
    'documenter',
    'bukti digital',
    'hak asasi manusia',
    'LBH',
    'penggusuran',
    'sengketa lahan',
    'Indonesia',
  ],
};

import NavWrapper from '@/components/ui/NavWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-900`}
      >
        <div className="min-h-screen flex flex-col">
          <NavWrapper>{children}</NavWrapper>
        </div>
      </body>
    </html>
  );
}
