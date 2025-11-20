import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Data Science Galaxy',
  description: 'Explore Data Science topics in an interactive galaxy visualization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

