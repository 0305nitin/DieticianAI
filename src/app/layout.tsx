import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import Sidebar from '@/components/ui/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'DieticianAI — AI Nutrition Scanner for Asian Food',
  description:
    'Snap a photo of any Asian or hawker meal and get instant calorie counts, macro breakdowns, hidden-ingredient analysis, and personalised daily targets — powered by AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${serif.variable}`}>
      <body className={inter.className}>
        <ThemeProvider>
          <Sidebar />
          <main className="md:pl-60 min-h-dvh">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
