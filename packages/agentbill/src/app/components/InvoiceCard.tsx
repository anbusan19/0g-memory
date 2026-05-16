interface Invoice {
  invoiceId: string;
  clientName: string;
  items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: string;
  notes: string;
}

export default function InvoiceCard({ invoice }: { invoice: Invoice }) {
  return (
    <div style={{ border: 'var(--border-lg)', background: 'var(--surface)' }}>

      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        gap: 24, padding: '20px 24px',
        borderBottom: 'var(--border-lg)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 6 }}>
            Invoice
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--og-green)', letterSpacing: '0.04em' }}>
            {invoice.invoiceId}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 6 }}>
            Bill To
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--white)', lineHeight: 1 }}>
            {invoice.clientName}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', marginTop: 5, letterSpacing: '0.06em' }}>
            Due: {invoice.dueDate}
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={{ padding: '0 24px' }}>
        <table className="inv-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'inherit' }}>{item.description}</td>
                <td>{item.quantity}</td>
                <td>${item.rate.toLocaleString()}</td>
                <td>${item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ padding: '16px 24px', borderTop: 'var(--border-lg)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-400)' }}>
          Subtotal: <span style={{ color: 'var(--white)', marginLeft: 8 }}>${invoice.subtotal.toLocaleString()}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-400)' }}>
          Tax (10%): <span style={{ color: 'var(--white)', marginLeft: 8 }}>${invoice.tax.toLocaleString()}</span>
        </div>
        <div style={{ borderTop: 'var(--border-lg)', paddingTop: 10, marginTop: 4, width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 32, color: 'var(--og-green)', lineHeight: 1 }}>
            ${invoice.total.toLocaleString()}{' '}
            <span style={{ fontSize: 14, fontStyle: 'normal', fontFamily: 'var(--font-mono)' }}>{invoice.currency}</span>
          </span>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div style={{ padding: '12px 24px', borderTop: 'var(--border-lg)', background: 'var(--off)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Notes
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-600)', lineHeight: 1.7 }}>
            {invoice.notes}
          </div>
        </div>
      )}

    </div>
  );
}
