'use client';
import { useState } from 'react';

interface Props {
  onGenerate: (clientName: string, jobDescription: string) => void;
  loading: boolean;
}

export default function InvoiceForm({ onGenerate, loading }: Props) {
  const [clientName, setClientName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">
          Client Name
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="e.g. TechCorp Inc"
          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88] transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="e.g. 40 hours of API development for payment integration at $150/hr"
          rows={3}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88] transition-colors resize-none"
        />
      </div>

      <button
        onClick={() => onGenerate(clientName, jobDescription)}
        disabled={loading || !clientName || !jobDescription}
        className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-lg hover:bg-[#00cc6a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block">&#10227;</span>
            Generating via 0G Compute...
          </span>
        ) : (
          '⚡ Generate Invoice'
        )}
      </button>
    </div>
  );
}
