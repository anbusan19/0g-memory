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
    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Invoice</div>
          <div className="text-[#00ff88] font-mono text-lg font-bold">
            {invoice.invoiceId}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Bill To</div>
          <div className="text-white font-bold">{invoice.clientName}</div>
          <div className="text-gray-400 text-xs">Due: {invoice.dueDate}</div>
        </div>
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-[#222]">
            <th className="text-left pb-2">Description</th>
            <th className="text-right pb-2">Qty</th>
            <th className="text-right pb-2">Rate</th>
            <th className="text-right pb-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i} className="border-b border-[#1a1a1a]">
              <td className="py-2 text-white">{item.description}</td>
              <td className="py-2 text-right text-gray-300">{item.quantity}</td>
              <td className="py-2 text-right text-gray-300">${item.rate}</td>
              <td className="py-2 text-right text-white">
                ${item.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-sm text-right">
        <div className="text-gray-400">
          Subtotal:{' '}
          <span className="text-white">${invoice.subtotal.toLocaleString()}</span>
        </div>
        <div className="text-gray-400">
          Tax (10%):{' '}
          <span className="text-white">${invoice.tax.toLocaleString()}</span>
        </div>
        <div className="text-[#00ff88] font-bold text-xl">
          Total: ${invoice.total.toLocaleString()} {invoice.currency}
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-4 p-3 bg-black/20 rounded text-gray-400 text-xs">
          {invoice.notes}
        </div>
      )}
    </div>
  );
}
