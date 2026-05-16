'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InvoiceForm from '../components/InvoiceForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { WalletConnect } from '../components/WalletConnect';
import InvoiceCard from '../components/InvoiceCard';
import MemoryPanel from '../components/MemoryPanel';
import TxProof from '../components/TxProof';

interface GenerateResponse {
  success: boolean;
  invoice: {
    invoiceId: string;
    clientName: string;
    agentWallet: string;
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
  { label: '0G Memory',   detail: 'Recalling client history from 0G Storage KV' },
  { label: '0G Compute',  detail: 'Parsing job description via AI inference' },
  { label: '0G Storage',  detail: 'Archiving invoice to decentralized storage' },
  { label: '0G Chain',    detail: 'Registering payment on-chain' },
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS ?? '';
const CONTRACT_ABI = [
  'function registerInvoice(string invoiceId, address agent, string storageRootHash) external',
  'function pay(string invoiceId) external payable',
];

export default function DemoPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState(0);
  const [payState, setPayState] = useState<'idle' | 'registering' | 'paying' | 'paid' | 'error'>('idle');
  const [payStep, setPayStep] = useState<string>('');
  const [payTxHash, setPayTxHash] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) { setLoadStep(0); return; }
    const timer = setInterval(() => setLoadStep(s => Math.min(s + 1, PIPELINE_STEPS.length - 1)), 2400);
    return () => clearInterval(timer);
  }, [loading]);

  async function handleGenerate(clientName: string, jobDescription: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setPayState('idle');
    setPayStep('');
    setPayTxHash(null);
    setPayError(null);
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

  async function handlePay() {
    if (!result || !walletAddress) return;
    setPayError(null);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!CONTRACT_ADDRESS) throw new Error('Contract not deployed — set NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS in .env');

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Step 1: register the invoice from the user's wallet.
      // If the backend already registered it the contract reverts "Invoice exists" — that's fine, skip.
      setPayState('registering');
      setPayStep('Confirm registration in MetaMask…');
      try {
        const regTx = await contract.registerInvoice(
          result.invoice.invoiceId,
          result.invoice.agentWallet,
          result.proofs.storageRootHash,
        );
        setPayStep('Waiting for registration confirmation…');
        await regTx.wait();
      } catch (e: unknown) {
        const msg = String((e as { reason?: string; message?: string }).reason ?? (e as { message?: string }).message ?? e);
        // "Invoice exists" means the backend already registered it — proceed to pay
        if (!msg.toLowerCase().includes('invoice exists') && !msg.toLowerCase().includes('already')) throw e;
      }

      // Step 2: pay the invoice
      setPayState('paying');
      setPayStep('Confirm payment in MetaMask…');
      const payTx = await contract.pay(result.invoice.invoiceId, {
        value: ethers.parseEther('0.001'),
      });
      setPayStep('Waiting for payment confirmation…');
      const receipt = await payTx.wait();
      setPayTxHash(receipt.hash);
      setPayStep('');
      setPayState('paid');
    } catch (e: unknown) {
      const msg = (e as { reason?: string; message?: string }).reason ?? (e as { message?: string }).message ?? String(e);
      setPayError(msg);
      setPayState('error');
    }
  }

  const canGenerate = !!walletAddress && !loading;

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--white)' }}>

      {/* ── Nav ── */}
      <nav style={{ height: 48, borderBottom: 'var(--border-lg)', display: 'flex', alignItems: 'stretch', background: 'var(--nav-bg)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="nav-logo">
            <img src="/logo-navbar.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
            0G Memory
          </div>
        </Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 20px', borderRight: 'var(--border-lg)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-400)', letterSpacing: '0.06em' }}>
            / agentbill
          </span>
        </div>
        <Link href="/" className="nav-link">← Back</Link>
        <ThemeToggle />
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

        {/* Left — Wallet + Form */}
        <div
          className="demo-form-col"
          style={{ borderRight: 'var(--border-lg)', padding: '40px 48px', position: 'sticky', top: 0, alignSelf: 'start' }}
        >
          {/* Step 00 — Connect wallet */}
          <div className="sec-hdr" style={{ marginBottom: 16 }}>
            <span className="sec-num">00</span>
            <h3 style={{ margin: 0 }}>Connect <em>Wallet</em></h3>
          </div>

          <WalletConnect
            onConnect={addr => setWalletAddress(addr)}
            onDisconnect={() => { setWalletAddress(null); setResult(null); }}
          />

          {!walletAddress && (
            <div className="hl" style={{ marginTop: 12 }}>
              <span className="hl-icon">◈</span>
              <span style={{ fontSize: 11 }}>
                Connect your MetaMask wallet on 0G Galileo Testnet to generate and pay invoices on-chain.
              </span>
            </div>
          )}

          {/* Step 01 — Invoice form (gated behind wallet) */}
          <div style={{ marginTop: 36 }}>
            <div className="sec-hdr" style={{ marginBottom: 28 }}>
              <span className="sec-num">01</span>
              <h3 style={{ margin: 0, opacity: walletAddress ? 1 : 0.35 }}>Invoice <em>Parameters</em></h3>
            </div>

            <div style={{ opacity: walletAddress ? 1 : 0.35, pointerEvents: walletAddress ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
              <InvoiceForm onGenerate={handleGenerate} loading={loading} disabled={!canGenerate} />
            </div>
          </div>

          {error && (
            <div className="hl" style={{ marginTop: 20, borderColor: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
              <span className="hl-icon" style={{ color: '#f87171' }}>✕</span>
              <span style={{ color: '#f87171', fontSize: 12 }}>{error.replace('Error: ', '')}</span>
            </div>
          )}

          {walletAddress && (
            <div className="hl" style={{ marginTop: 20 }}>
              <span className="hl-icon">◈</span>
              <span style={{ fontSize: 11 }}>
                AI parses your description, archives the invoice to 0G Storage, and registers it on 0G Chain. You then pay on-chain from your connected wallet.
              </span>
            </div>
          )}
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
                  {walletAddress ? 'Awaiting generation' : 'Connect wallet first'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(240,237,232,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {walletAddress ? 'Complete the form → generate' : 'Step 00 → connect MetaMask'}
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
                    background: i <= loadStep ? 'var(--og-green)' : 'rgba(240,237,232,0.2)',
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
                  {i < loadStep && <span style={{ color: 'var(--og-green)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>✓</span>}
                  {i === loadStep && <span className="spin" style={{ color: 'var(--og-green)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>◌</span>}
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

              {/* ── Step 03 — Pay Invoice ── */}
              <div style={{ border: 'var(--border-lg)', padding: '24px 24px' }}>
                <div className="sec-hdr" style={{ marginBottom: 20 }}>
                  <span className="sec-num">03</span>
                  <h3 style={{ margin: 0 }}>Pay <em>Invoice</em></h3>
                </div>

                {payState === 'idle' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                          Invoice Amount
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--white)' }}>
                          ${result.invoice.total.toLocaleString()} {result.invoice.currency}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                          Demo On-Chain Payment
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--og-green)' }}>
                          0.001 OG
                        </div>
                      </div>
                    </div>

                    <div className="hl" style={{ marginBottom: 16 }}>
                      <span className="hl-icon">◈</span>
                      <span style={{ fontSize: 11 }}>
                        Pays <strong style={{ color: 'var(--white)' }}>{result.invoice.invoiceId}</strong> on-chain via the AgentPayment escrow contract. MetaMask will open to confirm the transaction from <strong style={{ color: 'var(--og-green)' }}>{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</strong>.
                      </span>
                    </div>

                    <button
                      onClick={handlePay}
                      className="btn-primary"
                      style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      → Pay Invoice on 0G Chain
                    </button>
                  </>
                )}

                {(payState === 'registering' || payState === 'paying') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
                    {/* registration step */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {payState === 'registering' ? (
                        <span className="spin" style={{ color: 'var(--og-green)', fontSize: 14, flexShrink: 0 }}>◌</span>
                      ) : (
                        <span style={{ color: 'var(--og-green)', fontSize: 12, flexShrink: 0 }}>✓</span>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: payState === 'registering' ? 'var(--white)' : 'var(--gray-400)', letterSpacing: '0.04em', fontWeight: 700, textTransform: 'uppercase' }}>
                          Register Invoice on 0G Chain
                        </div>
                        {payState === 'registering' && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', marginTop: 2 }}>{payStep}</div>
                        )}
                      </div>
                    </div>
                    {/* payment step */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {payState === 'paying' ? (
                        <span className="spin" style={{ color: 'var(--og-green)', fontSize: 14, flexShrink: 0 }}>◌</span>
                      ) : (
                        <span style={{ color: 'rgba(240,237,232,0.2)', fontSize: 12, flexShrink: 0 }}>○</span>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: payState === 'paying' ? 'var(--white)' : 'var(--gray-400)', letterSpacing: '0.04em', fontWeight: 700, textTransform: 'uppercase' }}>
                          Pay Invoice (0.001 OG)
                        </div>
                        {payState === 'paying' && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', marginTop: 2 }}>{payStep}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {payState === 'paid' && payTxHash && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="hl" style={{ borderColor: 'var(--og-green)', background: 'var(--og-green-dim)' }}>
                      <span className="hl-icon" style={{ color: 'var(--og-green)' }}>✓</span>
                      <span style={{ fontSize: 12, color: 'var(--og-green)' }}>Payment confirmed on 0G Chain</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Payment Transaction
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--og-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {payTxHash}
                        </code>
                        <a
                          href={`https://chainscan-galileo.0g.ai/tx/${payTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--og-green)', border: 'var(--border-lg)', padding: '4px 10px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          ChainScan ↗
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {payState === 'error' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="hl" style={{ borderColor: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
                      <span className="hl-icon" style={{ color: '#f87171' }}>✕</span>
                      <span style={{ color: '#f87171', fontSize: 12 }}>{payError}</span>
                    </div>
                    <button
                      onClick={() => { setPayState('idle'); setPayStep(''); setPayError(null); }}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-400)', background: 'none', border: 'var(--border-lg)', padding: '8px 16px', cursor: 'pointer', letterSpacing: '0.06em', alignSelf: 'flex-start' }}
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
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
