import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentBill — Autonomous Invoice Agent',
  description: 'Persistent decentralized memory for AI agents, powered by 0G Storage. Generate invoices with 0G Compute, settle payments on 0G Chain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
