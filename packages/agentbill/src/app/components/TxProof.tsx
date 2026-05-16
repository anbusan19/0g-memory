interface Proofs {
  storageRootHash: string;
  storageScanUrl: string;
  chainTxHash: string;
  chainScanUrl: string;
}

function ProofRow({ label, sublabel, hash, scanUrl, scanLabel }: {
  label: string; sublabel: string; hash: string; scanUrl: string; scanLabel: string;
}) {
  return (
    <div style={{ borderBottom: 'var(--border-lg)' }}>
      <div style={{ padding: '14px 20px', borderBottom: 'var(--border)', background: 'var(--off)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.04em' }}>
          {sublabel}
        </div>
      </div>
      <div className="hash-row">
        <code className="hash-val">{hash}</code>
        <a
          href={scanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
          style={{ padding: '6px 14px', fontSize: 9, marginLeft: 0, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {scanLabel} ↗
        </a>
      </div>
    </div>
  );
}

export default function TxProof({ proofs }: { proofs: Proofs }) {
  return (
    <div style={{ border: 'var(--border-lg)', background: 'var(--surface)' }}>

      {/* Section header */}
      <div style={{ padding: '14px 20px', borderBottom: 'var(--border-lg)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="live-dot" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--og-green)' }}>
          On-Chain Proofs
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', marginLeft: 'auto', letterSpacing: '0.06em' }}>
          Verifiable · Permanent
        </span>
      </div>

      <ProofRow
        label="0G Storage"
        sublabel="Invoice archive — retrievable by root hash"
        hash={proofs.storageRootHash}
        scanUrl={proofs.storageScanUrl}
        scanLabel="StorageScan"
      />
      <ProofRow
        label="0G Chain"
        sublabel="Smart contract — payment escrow registered"
        hash={proofs.chainTxHash}
        scanUrl={proofs.chainScanUrl}
        scanLabel="ChainScan"
      />

    </div>
  );
}
