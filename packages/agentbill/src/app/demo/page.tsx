'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceCard from '../components/InvoiceCard';
import MemoryPanel from '../components/MemoryPanel';
import TxProof from '../components/TxProof';

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

const PIPELINE_STEPS = [
  { label: '0G Compute', detail: 'Parsing job description via AI inference' },
  { label: '0G Storage', detail: 'Archiving invoice to decentralized storage' },
  { label: '0G Chain', detail: 'Registering payment on-chain' },
  { label: 'Proofs', detail: 'Verifying storage root & chain receipt' },
];

export default function DemoPage() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState(0);

  useEffect(() => {
    if (!loading) { setLoadStep(0); return; }
    const timer = setInterval(() => setLoadStep(s => Math.min(s + 1, PIPELINE_STEPS.length - 1)), 2400);
    return () => clearInterval(timer);
  }, [loading]);

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
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--white)' }}>

      {/* ── Nav ── */}
      <nav style={{ height: 48, borderBottom: 'var(--border-lg)', display: 'flex', alignItems: 'stretch' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="nav-logo">
            <div className="nav-dot">
              <span /><span /><span /><span />
            </div>
            0G Memory
          </div>
        </Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 20px', borderRight: 'var(--border-lg)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
            / agentbill
          </span>
        </div>
        <Link href="/" className="nav-link">← Back</Link>
      </nav>

      {/* ── Header ── */}
      <div className="section" style={{ padding: '56px 60px 44px' }}>
        <div className="eyebrow">AgentBill Demo</div>
        <h1>Autonomous <em>Invoice</em><br />Agent</h1>
        <div style={{ display: 'flex', gap: 0, marginTop: 28 }}>
          {['0G Compute', '0G Storage', '0G Chain'].map((layer, i) => (
            <div key={layer} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                border: 'var(--border-lg)', padding: '6px 16px',
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'var(--gray-400)', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginLeft: i > 0 ? -1.5 : 0,
              }}>
                {layer}
              </div>
              {i < 2 && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-400)', padding: '0 4px', position: 'relative', zIndex: 1 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="demo-grid">

        {/* Left — Form */}
        <div
          className="demo-form-col"
          style={{ borderRight: 'var(--border-lg)', padding: '40px 48px', position: 'sticky', top: 0, alignSelf: 'start' }}
        >
          <div className="sec-hdr" style={{ marginBottom: 28 }}>
            <span className="sec-num">01</span>
            <h3 style={{ margin: 0 }}>Invoice <em>Parameters</em></h3>
          </div>

          <InvoiceForm onGenerate={handleGenerate} loading={loading} />

          {error && (
            <div className="hl" style={{ marginTop: 20, borderColor: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
              <span className="hl-icon" style={{ color: '#f87171' }}>✕</span>
              <span style={{ color: '#f87171', fontSize: 12 }}>{error.replace('Error: ', '')}</span>
            </div>
          )}

          <div className="hl" style={{ marginTop: 20 }}>
            <span className="hl-icon">◈</span>
            <span style={{ fontSize: 11 }}>
              AI parses your description into a structured invoice, then stores and registers it across the 0G stack.
            </span>
          </div>
        </div>

        {/* Right — Output */}
        <div style={{ padding: '40px 48px' }}>
          <div className="sec-hdr" style={{ marginBottom: 28 }}>
            <span className="sec-num">02</span>
            <h3 style={{ margin: 0 }}>Agent <em>Output</em></h3>
          </div>

          {/* Empty state */}
          {!result && !loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, gap: 0 }}>
              <div style={{ border: 'var(--border-lg)', padding: '32px 48px', textAlign: 'center', width: '100%', maxWidth: 400 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 30, color: 'var(--gray-400)', lineHeight: 1.2, marginBottom: 12 }}>
                  Awaiting generation
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(240,237,232,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Complete the form → generate
                </div>
                <div style={{
                  display: 'inline-block', width: 7, height: 16, background: 'var(--og-green)',
                  marginTop: 16, animation: 'livepulse 1s ease-in-out infinite',
                }} />
              </div>
            </div>
          )}

          {/* Loading — pipeline steps */}
          {loading && (
            <div>
              {PIPELINE_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`pipeline-step${i === loadStep ? ' active' : i < loadStep ? ' done' : ''}`}
                >
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: i < loadStep ? 'var(--og-green)' : i === loadStep ? 'var(--og-green)' : 'rgba(240,237,232,0.2)',
                    animation: i === loadStep ? 'livepulse 1.2s ease-in-out infinite' : 'none',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: i <= loadStep ? 'var(--white)' : 'var(--gray-400)', marginBottom: 2 }}>
                      {step.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.04em' }}>
                      {step.detail}
                    </div>
                  </div>
                  {i < loadStep && (
                    <span style={{ color: 'var(--og-green)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>✓</span>
                  )}
                  {i === loadStep && (
                    <span className="spin" style={{ color: 'var(--og-green)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>◌</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {result.isReturningClient && (
                <MemoryPanel clientHistory={result.clientHistory} clientName={result.invoice.clientName} />
              )}
              <InvoiceCard invoice={result.invoice} />
              <TxProof proofs={result.proofs} />
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer>
        <span className="footer-logo">0G Memory</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className="footer-link">0G Network</a>
          <Link href="/" className="footer-link">Landing</Link>
        </div>
      </footer>
    </main>
  );
}
