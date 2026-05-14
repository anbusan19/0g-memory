interface Proofs {
  storageRootHash: string;
  storageScanUrl: string;
  chainTxHash: string;
  chainScanUrl: string;
}

export default function TxProof({ proofs }: { proofs: Proofs }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider">
        On-Chain Proofs
      </div>

      <div>
        <div className="text-xs text-gray-500 mb-1">0G Storage — Invoice Archive</div>
        <div className="flex items-center justify-between gap-3">
          <code className="text-[#00ff88] text-xs truncate font-mono flex-1">
            {proofs.storageRootHash}
          </code>
          <a
            href={proofs.storageScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#00ff88] border border-[#00ff88]/30 px-2 py-1 rounded hover:bg-[#00ff88]/10 whitespace-nowrap transition-colors"
          >
            StorageScan ↗
          </a>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] pt-4">
        <div className="text-xs text-gray-500 mb-1">0G Chain — Contract Transaction</div>
        <div className="flex items-center justify-between gap-3">
          <code className="text-[#00ff88] text-xs truncate font-mono flex-1">
            {proofs.chainTxHash}
          </code>
          <a
            href={proofs.chainScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#00ff88] border border-[#00ff88]/30 px-2 py-1 rounded hover:bg-[#00ff88]/10 whitespace-nowrap transition-colors"
          >
            ChainScan ↗
          </a>
        </div>
      </div>
    </div>
  );
}
