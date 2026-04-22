import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'quotetrades — quotes for local trades',
  description: 'Lead to quote in minutes. Built for HVAC, electrical, plumbing, landscaping, and roofing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>{children}</body>
    </html>
  );
}
