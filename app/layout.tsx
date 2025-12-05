import type { Metadata } from 'next';
import { Noto_Sans_TC, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers/Providers';

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'CanLog - 寵物罐頭營養分析',
  description: '上傳寵物罐頭營養標示圖片，自動分析營養成分比例',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSansTC.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

