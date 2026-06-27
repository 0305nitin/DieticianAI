import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import Navbar from '@/components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HawkerSense — AI Food Scanner for Asian Dishes',
  description:
    'Snap a photo of your hawker meal and get instant calorie counts, macro breakdowns, and hidden ingredient analysis powered by Gemini AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
