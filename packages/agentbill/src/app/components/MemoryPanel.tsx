interface Props {
  clientHistory: unknown;
  clientName: string;
}

export default function MemoryPanel({ clientHistory, clientName }: Props) {
  const h = clientHistory as {
    totalInvoiced: number;
    invoiceCount: number;
    lastJobDescription: string;
    lastInvoiceId: string;
    lastSeen: string;
  };

  return (
    <div style={{ border: '1.5px solid var(--og-cyan)', background: 'var(--og-cyan-dim)' }}>

      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(34,211,238,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="live-dot" style={{ background: 'var(--og-cyan)', animation: 'livepulse 1.2s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--og-cyan)' }}>
          0G-Memory — Client Recalled
        </span>
      </div>

      {/* Client greeting */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(34,211,238,0.18)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gray-600)' }}>
          Welcome back,{' '}
        </span>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--white)' }}>
          {clientName}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gray-600)' }}>
          . Agent retrieved your history from 0G Storage.
        </span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(34,211,238,0.18)' }}>
        <div style={{ padding: '14px 20px', borderRight: '1px solid rgba(34,211,238,0.18)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Total Invoiced
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--og-cyan)', lineHeight: 1 }}>
            ${h.totalInvoiced?.toLocaleString() ?? '—'}
          </div>
        </div>
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Past Invoices
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--og-cyan)', lineHeight: 1 }}>
            {h.invoiceCount ?? '—'}
          </div>
        </div>
      </div>

      {/* Last job + invoice */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: '14px 20px', borderRight: '1px solid rgba(34,211,238,0.18)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Last Job
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--white)', lineHeight: 1.6 }}>
            {h.lastJobDescription ?? '—'}
          </div>
        </div>
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Last Invoice ID
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--og-cyan)', wordBreak: 'break-all' }}>
            {h.lastInvoiceId ?? '—'}
          </div>
        </div>
      </div>

    </div>
  );
}
