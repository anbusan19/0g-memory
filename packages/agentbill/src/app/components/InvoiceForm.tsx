'use client';
import { useState } from 'react';

interface Props {
  onGenerate: (clientName: string, jobDescription: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export default function InvoiceForm({ onGenerate, loading, disabled = false }: Props) {
  const [clientName, setClientName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const canSubmit = !loading && !disabled && !!clientName.trim() && !!jobDescription.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <label style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--gray-400)',
          display: 'block', marginBottom: 8,
        }}>
          Client Name
        </label>
        <input
          type="text"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          placeholder="e.g. TechCorp Inc"
          className="demo-input"
          disabled={loading}
        />
      </div>

      <div>
        <label style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--gray-400)',
          display: 'block', marginBottom: 8,
        }}>
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          placeholder="e.g. 40 hours of API development for payment integration at $150/hr"
          rows={4}
          className="demo-textarea"
          disabled={loading}
        />
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'rgba(240,237,232,0.25)', marginTop: 6, letterSpacing: '0.04em',
        }}>
          Include hours, rate, and scope — the agent structures the rest.
        </div>
      </div>

      <button
        onClick={() => onGenerate(clientName.trim(), jobDescription.trim())}
        disabled={!canSubmit}
        className="btn-primary"
        style={{
          width: '100%', textAlign: 'center',
          opacity: canSubmit ? 1 : 0.35,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? (
          <>
            <span className="spin">◌</span>
            Generating via 0G Compute...
          </>
        ) : (
          '→ Generate Invoice'
        )}
      </button>

    </div>
  );
}
