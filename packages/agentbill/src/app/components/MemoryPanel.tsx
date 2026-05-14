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
    <div className="bg-[#001a0d] border border-[#00ff88]/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
        <span className="text-[#00ff88] text-sm font-bold">
          ChainMemory — Client Recalled
        </span>
      </div>
      <p className="text-gray-300 text-sm mb-3">
        Welcome back, <strong className="text-white">{clientName}</strong>.
        Agent retrieved your history from 0G Storage.
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 text-xs mb-1">Total Invoiced</div>
          <div className="text-white font-bold">
            ${h.totalInvoiced?.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 text-xs mb-1">Past Invoices</div>
          <div className="text-white font-bold">{h.invoiceCount}</div>
        </div>
        <div className="bg-black/30 rounded p-3 col-span-2">
          <div className="text-gray-400 text-xs mb-1">Last Job</div>
          <div className="text-white">{h.lastJobDescription}</div>
        </div>
        <div className="bg-black/30 rounded p-3 col-span-2">
          <div className="text-gray-400 text-xs mb-1">Last Invoice</div>
          <div className="text-[#00ff88] font-mono">{h.lastInvoiceId}</div>
        </div>
      </div>
    </div>
  );
}
