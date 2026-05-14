'use client';

import { useState } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoiceCard from './components/InvoiceCard';
import MemoryPanel from './components/MemoryPanel';
import TxProof from './components/TxProof';

interface GenerateResponse {
  success: boolean;
  invoice: {
    invoiceId: string;
    clientName: string;
    items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    dueDate: string;
    notes: string;
  };
  proofs: {
    storageRootHash: string;
    storageScanUrl: string;
    chainTxHash: string;
    chainScanUrl: string;
  };
  isReturningClient: boolean;
  clientHistory: unknown;
}

export default function Home() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(clientName: string, jobDescription: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[#00ff88] text-sm tracking-widest uppercase">
              ChainMemory + AgentBill
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Autonomous Invoice Agent
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Powered by 0G Compute &middot; Stored on 0G Storage &middot; Settled on 0G Chain
          </p>
        </div>

        {/* Form */}
        <InvoiceForm onGenerate={handleGenerate} loading={loading} />

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Demo wow moment — ChainMemory recall banner */}
            {result.isReturningClient && (
              <MemoryPanel
                clientHistory={result.clientHistory}
                clientName={result.invoice.clientName}
              />
            )}

            {/* Generated invoice */}
            <InvoiceCard invoice={result.invoice} />

            {/* On-chain proof links */}
            <TxProof proofs={result.proofs} />
          </div>
        )}

      </div>
    </main>
  );
}
