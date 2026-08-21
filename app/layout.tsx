import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'FamilyFin AI - Family Financial Intelligence Platform',
  description: 'AI-Powered Family Financial Intelligence Platform for tracking transactions, SIPs, budgets, and AI insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-[#F8FAFC] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

