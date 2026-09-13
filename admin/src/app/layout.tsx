import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'ReachWithUs Admin Portal — Requirement Moderation & Governance',
  description: 'Enterprise governance portal for ReachWithUs requirement discovery and ₹10/month subscription platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
