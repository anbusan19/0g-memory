'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type TabKey = 'remember' | 'recall' | 'archive';

/* ── Purple shade palette ───────────────────────────────────────────────── */
const P1 = '#c966ff';
const P2 = '#a855f7';
const P3 = '#7c3aed';
const P4 = '#e879f9';

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <Architecture />
      <HowItWorks />
      <SDKSection />
      <AgentBill />
      <Footer />
    </div>
  );
}

/* ─── Neural Network Sprite ──────────────────────────────────────────────── */
function NeuralSprite() {
  type Layer = { x: number; ys: number[] };
  const layers: Layer[] = [
    { x: 52,  ys: [78, 152, 226, 300] },
    { x: 185, ys: [48, 108, 168, 228, 288, 348] },
    { x: 335, ys: [48, 108, 168, 228, 288, 348] },
    { x: 468, ys: [118, 198, 278] },
  ];

  const edges: { x1:number; y1:number; x2:number; y2:number; k:string }[] = [];
  for (let li = 0; li < layers.length - 1; li++) {
    for (const y1 of layers[li].ys) {
      for (const y2 of layers[li + 1].ys) {
        edges.push({ x1: layers[li].x, y1, x2: layers[li + 1].x, y2, k: `${li}-${y1}-${y2}` });
      }
    }
  }

  // Dense L1→L2 edges that get a slow "activity" flicker
  const activityEdges = [
    { li:1,ni:1, lj:2,nj:1 }, { li:1,ni:2, lj:2,nj:3 }, { li:1,ni:3, lj:2,nj:2 },
    { li:1,ni:4, lj:2,nj:4 }, { li:1,ni:0, lj:2,nj:5 }, { li:1,ni:5, lj:2,nj:0 },
  ].map((p, i) => ({
    x1: layers[p.li].x, y1: layers[p.li].ys[p.ni],
    x2: layers[p.lj].x, y2: layers[p.lj].ys[p.nj],
    dur: 2.8 + i * 0.6, begin: i * 0.55,
  }));

  type PulseSpec = { li:number; ni:number; lj:number; nj:number; dur:number; begin:number };
  const pulseSpecs: PulseSpec[] = [
    // L0→L1 — 10 pulses
    { li:0,ni:0, lj:1,nj:0, dur:1.0, begin:0.0 },
    { li:0,ni:0, lj:1,nj:3, dur:1.2, begin:1.6 },
    { li:0,ni:1, lj:1,nj:2, dur:0.9, begin:0.5 },
    { li:0,ni:1, lj:1,nj:5, dur:1.1, begin:2.2 },
    { li:0,ni:2, lj:1,nj:1, dur:1.0, begin:0.9 },
    { li:0,ni:2, lj:1,nj:4, dur:1.3, begin:1.9 },
    { li:0,ni:3, lj:1,nj:0, dur:1.1, begin:0.3 },
    { li:0,ni:3, lj:1,nj:5, dur:1.2, begin:2.7 },
    { li:0,ni:0, lj:1,nj:5, dur:1.4, begin:0.7 },
    { li:0,ni:2, lj:1,nj:3, dur:0.9, begin:3.4 },
    // L1→L2 — 12 pulses
    { li:1,ni:0, lj:2,nj:2, dur:1.5, begin:0.2 },
    { li:1,ni:0, lj:2,nj:5, dur:1.7, begin:2.9 },
    { li:1,ni:1, lj:2,nj:1, dur:1.3, begin:0.8 },
    { li:1,ni:2, lj:2,nj:4, dur:1.4, begin:1.5 },
    { li:1,ni:2, lj:2,nj:0, dur:1.6, begin:3.7 },
    { li:1,ni:3, lj:2,nj:3, dur:1.5, begin:0.4 },
    { li:1,ni:3, lj:2,nj:1, dur:1.3, begin:2.1 },
    { li:1,ni:4, lj:2,nj:4, dur:1.4, begin:1.0 },
    { li:1,ni:4, lj:2,nj:2, dur:1.7, begin:3.2 },
    { li:1,ni:5, lj:2,nj:5, dur:1.5, begin:0.0 },
    { li:1,ni:5, lj:2,nj:0, dur:1.6, begin:2.4 },
    { li:1,ni:1, lj:2,nj:3, dur:1.4, begin:4.1 },
    // L2→L3 — 8 pulses
    { li:2,ni:0, lj:3,nj:0, dur:1.0, begin:0.6 },
    { li:2,ni:1, lj:3,nj:1, dur:1.1, begin:1.9 },
    { li:2,ni:2, lj:3,nj:0, dur:0.9, begin:0.1 },
    { li:2,ni:3, lj:3,nj:1, dur:1.2, begin:2.6 },
    { li:2,ni:3, lj:3,nj:2, dur:1.0, begin:0.9 },
    { li:2,ni:4, lj:3,nj:2, dur:1.1, begin:1.4 },
    { li:2,ni:5, lj:3,nj:1, dur:1.3, begin:3.3 },
    { li:2,ni:4, lj:3,nj:0, dur:1.0, begin:4.4 },
  ];

  const pulses = pulseSpecs.map(p => ({
    x1: layers[p.li].x, y1: layers[p.li].ys[p.ni],
    x2: layers[p.lj].x, y2: layers[p.lj].ys[p.nj],
    dur: p.dur, begin: p.begin,
  }));

  return (
    <svg viewBox="0 0 520 400" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 360 }} aria-hidden="true">
      <defs>
        <radialGradient id="netBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(201,102,255,0.06)"/>
          <stop offset="100%" stopColor="rgba(201,102,255,0)"/>
        </radialGradient>
        <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ringGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Ambient background gradient */}
      <rect width="520" height="400" fill="url(#netBg)" rx="4"/>

      {/* Layer labels */}
      {(['Input','Hidden','Hidden','Output'] as const).map((lbl, li) => (
        <text key={li} x={layers[li].x} y={388} textAnchor="middle"
          style={{ fontFamily:'monospace', fontSize:8, fill:'rgba(201,102,255,0.4)', letterSpacing:'0.1em' }}>
          {lbl.toUpperCase()}
        </text>
      ))}

      {/* Base edges */}
      {edges.map(e => (
        <line key={e.k} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke="rgba(201,102,255,0.11)" strokeWidth="0.7"/>
      ))}

      {/* Activity edges — gentle opacity flicker on dense L1→L2 section */}
      {activityEdges.map((e, i) => (
        <line key={`act-${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke="#c966ff" strokeWidth="0.7">
          <animate attributeName="opacity"
            values="0;0.28;0.06;0.32;0.04;0.22;0"
            dur={`${e.dur}s`} repeatCount="indefinite" begin={`${e.begin}s`}/>
        </line>
      ))}

      {/* Expanding rings on I/O nodes */}
      {layers.map((layer, li) =>
        (li === 0 || li === 3) ? layer.ys.map((y, ni) => {
          const base = ((li * 2.1 + ni * 0.85) % 3.2).toFixed(2);
          return [0, 1.5].map((off, ri) => (
            <circle key={`ring-${li}-${ni}-${ri}`} cx={layer.x} cy={y}
              r={li === 3 ? 7 : 6.5} fill="none" stroke="#c966ff" strokeWidth="0.8"
              filter="url(#ringGlow)">
              <animate attributeName="r"
                values={li === 3 ? '7;26' : '6.5;24'}
                dur="2.2s" repeatCount="indefinite" begin={`${(parseFloat(base)+off).toFixed(2)}s`}/>
              <animate attributeName="opacity"
                values="0.55;0" dur="2.2s" repeatCount="indefinite"
                begin={`${(parseFloat(base)+off).toFixed(2)}s`}/>
            </circle>
          ));
        }) : null
      )}

      {/* Pulse dots */}
      {pulses.map((p, i) => (
        <circle key={i} r={3} fill="#c966ff" filter="url(#dotGlow)">
          <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.begin}s`}
            path={`M ${p.x1},${p.y1} L ${p.x2},${p.y2}`}/>
          <animate attributeName="opacity" values="0;1;1;0"
            keyTimes="0;0.07;0.93;1" dur={`${p.dur}s`}
            repeatCount="indefinite" begin={`${p.begin}s`}/>
        </circle>
      ))}

      {/* Nodes */}
      {layers.map((layer, li) =>
        layer.ys.map((y, ni) => {
          const isIO  = li === 0 || li === 3;
          const isOut = li === 3;
          const r     = isOut ? 7.5 : isIO ? 6.5 : 4.5;
          const from  = isIO  ? '0.7' : '0.35';
          const to    = '1';
          const dur   = `${1.6 + (ni % 3) * 0.5}s`;
          const beg   = `${((li * 2.2 + ni * 0.7) % 3.5).toFixed(2)}s`;
          return (
            <circle key={`n-${li}-${ni}`} cx={layer.x} cy={y} r={r}
              fill="#c966ff" filter={isIO ? 'url(#nodeGlow)' : undefined}>
              <animate attributeName="opacity" values={`${from};${to};${from}`}
                dur={dur} repeatCount="indefinite" begin={beg}/>
            </circle>
          );
        })
      )}
    </svg>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
function Navbar() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const ids = ['hero', 'architecture', 'how-it-works', 'sdk', 'agentbill'];
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const links = [
    { id: 'hero',         label: 'Overview' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'sdk',          label: 'SDK' },
    { id: 'agentbill',   label: 'AgentBill' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(14px)',
      borderBottom: 'var(--border-lg)', display: 'flex', alignItems: 'center', height: 52,
    }}>
      <div className="nav-logo">
        <div className="nav-dot"><span/><span/><span/><span/></div>
        0G-MEMORY
      </div>
      <div style={{ display: 'flex', height: '100%', overflowX: 'auto' }}>
        {links.map(l => (
          <a key={l.id} href={`#${l.id}`} className={`nav-link${active === l.id ? ' active' : ''}`}>
            {l.label}
          </a>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', paddingRight: 20, flexShrink: 0 }}>
        <Link href="/demo" className="btn-primary" style={{ fontSize: 10 }}>
          Try Demo
        </Link>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="hero" style={{ paddingTop: 52, borderBottom: 'var(--border-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="hero-grid">

      {/* LEFT */}
      <div style={{ padding: '72px 56px 60px', borderRight: 'var(--border-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow">Decentralized Agent Memory</div>
          <h1>0G-<em>Memory</em></h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2vw,24px)', color: 'var(--gray-600)', margin: '10px 0 24px', lineHeight: 1.3 }}>
            The persistent memory layer<br />for autonomous AI agents.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--gray-600)', maxWidth: 420, marginBottom: 32 }}>
            A drop-in SDK that gives any AI agent verifiable, cross-session memory
            backed by 0G Storage — KV for fast context, Log for immutable archival,
            and 0G Chain for on-chain settlement. No databases. No vendor lock-in.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Link href="/demo" className="btn-primary">Try AgentBill</Link>
            <a href="#architecture" className="btn-outline">Architecture</a>
            <a href="#sdk" className="btn-outline">SDK Docs</a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: 'var(--border-lg)', marginTop: 48 }}>
          {[
            { val: 'KV',    lbl: 'Fast agent context reads' },
            { val: 'Log',   lbl: 'Immutable invoice archive' },
            { val: 'Chain', lbl: '0G Chain escrow settlement' },
          ].map((s, i) => (
            <div key={s.lbl} style={{ padding: '18px 16px', borderRight: i < 2 ? 'var(--border-lg)' : 'none' }}>
              <div className="h-stat-val">{s.val}</div>
              <div className="h-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — neural network */}
      <div style={{ padding: '72px 44px 60px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
            Memory Architecture
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <NeuralSprite />
        </div>

        {/* Three attributes */}
        <div style={{ border: 'var(--border-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            { label: 'Verifiable',    sub: 'Root hash proof' },
            { label: 'Decentralized', sub: '0G Network' },
            { label: 'Drop-in SDK',   sub: 'Three methods' },
          ].map((p, i) => (
            <div key={p.label} style={{
              padding: '14px 12px', textAlign: 'center',
              borderRight: i < 2 ? 'var(--border-lg)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--og-green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                {p.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--gray-400)', letterSpacing: '0.04em' }}>
                {p.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Architecture ───────────────────────────────────────────────────────── */
function Architecture() {
  const layerColors = [P1, P2, P3];

  return (
    <section id="architecture" className="section">
      <div className="sec-hdr">
        <span className="sec-num">01</span>
        <h2>The <em>Decentralized Memory</em> Architecture</h2>
      </div>

      <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }}>
        <div>
          <h3>Why not a database?</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--gray-600)', marginBottom: 18 }}>
            Traditional AI agents store memory in centralized databases — a single point of failure,
            a vendor dependency, and an untrusted black box. If the database goes down, the agent loses its
            context. If the vendor changes terms, you migrate or lose everything. There is no proof the
            data was not modified.
          </p>
          <div className="hl">
            <div>0G-Memory writes every agent memory to <strong style={{ color: 'var(--white)' }}>0G Storage</strong> — a decentralized
            storage network. Each write returns a Merkle root hash. The hash is your cryptographic
            proof: anyone can verify the data on StorageScan, forever.</div>
          </div>
        </div>

        <div>
          <h3>Traditional Agent Memory vs 0G-Memory</h3>
          <div className="vs-table">
            <div className="vs-row hd">
              <div className="vs-cell">Capability</div>
              <div className="vs-cell">Traditional (DB/File)</div>
              <div className="vs-cell">0G-Memory</div>
            </div>
            {[
              ['Persistent across sessions',    '(if DB is up)',          <span key="a" className="tick-g">Always</span>],
              ['Cryptographically verifiable',  <span key="b1" className="tick-r">No proof</span>, <span key="b2" className="tick-g">Root hash</span>],
              ['Decentralized storage',         <span key="c1" className="tick-r">Central DB</span>, <span key="c2" className="tick-g">0G Network</span>],
              ['Tamper-proof archive',          <span key="d1" className="tick-r">No</span>,         <span key="d2" className="tick-g">Log layer</span>],
              ['Vendor lock-in',                <span key="e1" className="tick-r">High</span>,       <span key="e2" className="tick-g">None</span>],
              ['On-chain settlement',           <span key="f1" className="tick-r">No</span>,         <span key="f2" className="tick-g">0G Chain</span>],
              ['StorageScan proof link',        <span key="g1" className="tick-r">No</span>,         <span key="g2" className="tick-g">Yes</span>],
            ].map(([cap, old, newv]) => (
              <div key={String(cap)} className="vs-row">
                <div className="vs-cell">{cap}</div>
                <div className="vs-cell">{old}</div>
                <div className="vs-cell">{newv}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: 16 }}>Memory Layers</h3>
      <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
        {[
          {
            color: layerColors[0], tag: 'Layer 01 — Fast Reads',
            title: 'KV Stream',
            desc: 'Agent context, client profiles, and session state. Key-value pairs written to 0G\'s KV stream layer. Overwritable. Indexed by the agent\'s stream ID. Best for frequently read, mutable data.',
          },
          {
            color: layerColors[1], tag: 'Layer 02 — Immutable',
            title: 'Storage Log',
            desc: 'Invoices, events, and audit trails. Files uploaded to 0G Storage return a Merkle root hash. Append-only — data cannot be modified after upload. StorageScan provides a public URL for every archived record.',
          },
          {
            color: layerColors[2], tag: 'Layer 03 — Settlement',
            title: '0G Chain',
            desc: 'The AgentPayment contract anchors invoice IDs and storage root hashes on-chain. Clients pay into escrow on 0G Chain. The owner releases funds. Every invoice has a ChainScan link.',
          },
        ].map((l, i) => (
          <div key={l.title} style={{
            border: 'var(--border-lg)', padding: 24,
            borderLeft: i > 0 ? 'none' : 'var(--border-lg)',
            background: 'var(--surface)',
            borderTop: `3px solid ${l.color}`,
            transition: 'transform .18s, box-shadow .18s',
            cursor: 'default',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = `3px 3px 0 ${l.color}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: l.color, marginBottom: 10 }}>{l.tag}</div>
            <h3 style={{ color: 'var(--white)', marginBottom: 10 }}><em>{l.title}</em></h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--gray-600)' }}>{l.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How it Works ───────────────────────────────────────────────────────── */
function HowItWorks() {
  const [active, setActive] = useState<number | null>(null);

  const steps = [
    {
      num: '01', color: P1,
      title: 'Agent calls remember()',
      short: 'KV write + Log archive',
      detail: 'The agent calls memory.remember(key, value). Under the hood: (1) a KV write submits the data to the 0G KV stream layer for fast future reads, (2) a Log write uploads the full record to 0G Storage and returns a Merkle root hash, (3) the key to rootHash mapping is saved to a local index file for fast recall lookups.',
    },
    {
      num: '02', color: P2,
      title: 'Root hash returned',
      short: '0G Storage anchors the data',
      detail: 'The 0G Storage network confirms the upload, distributes the data across nodes, and returns a root hash. This hash is your cryptographic proof — anyone can verify the data at storagescan.0g.ai. The hash is also registered on 0G Chain via the AgentPayment contract for invoices.',
    },
    {
      num: '03', color: P3,
      title: 'Any session calls recall()',
      short: 'Data retrieved from 0G network',
      detail: 'In any future session — even after a full redeploy — the agent calls memory.recall(key). The local index resolves the root hash, then indexer.download() retrieves the file directly from the 0G Storage network. No central server. No database. The data is fetched from the decentralized network using the root hash as the address.',
    },
    {
      num: '04', color: P4,
      title: 'On-chain settlement',
      short: 'AgentPayment escrow on 0G Chain',
      detail: 'For invoices, registerInvoice() is called on the AgentPayment contract with the invoice ID and storage root hash as proof. The client calls pay() to lock funds in escrow. The agent owner calls release() to settle. Every step is visible on chainscan-galileo.0g.ai.',
    },
  ];

  return (
    <section id="how-it-works" className="section">
      <div className="sec-hdr">
        <span className="sec-num">02</span>
        <h2>How it <em>Works</em></h2>
      </div>

      <div style={{ border: 'var(--border-lg)', marginBottom: 40 }}>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {steps.map((s, i) => (
            <div
              key={s.num}
              onClick={() => setActive(active === i ? null : i)}
              style={{
                flex: 1, minWidth: 140, padding: '20px 18px',
                borderRight: i < steps.length - 1 ? 'var(--border-lg)' : 'none',
                cursor: 'pointer', textAlign: 'center',
                background: active === i ? `${s.color}0d` : '',
                borderTop: active === i ? `2px solid ${s.color}` : '2px solid transparent',
                transition: 'background .15s, border-top .15s',
              }}
              onMouseEnter={e => { if (active !== i) e.currentTarget.style.background = `${s.color}07`; }}
              onMouseLeave={e => { if (active !== i) e.currentTarget.style.background = ''; }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, marginBottom: 6, color: 'var(--white)' }}>{s.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.05em' }}>{s.short}</div>
            </div>
          ))}
        </div>
        {active !== null && (
          <div style={{ padding: '18px 22px', borderTop: 'var(--border-lg)', fontSize: 14, lineHeight: 1.75, color: 'var(--gray-600)', background: 'var(--off)' }}>
            {steps[active].detail}
          </div>
        )}
      </div>

      {/* Flow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', alignItems: 'center', gap: 0, border: 'var(--border-lg)' }}>
        {[
          { label: 'Agent',       sub: 'calls remember()', color: P1 },
          null,
          { label: '0G Storage',  sub: 'KV + Log write',   color: P2 },
          null,
          { label: '0G Chain',    sub: 'registerInvoice()', color: P3 },
          null,
          { label: 'StorageScan', sub: 'verifiable proof',  color: P4 },
        ].map((item, i) =>
          item === null ? (
            <div key={i} style={{ textAlign: 'center', padding: '0 4px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--gray-400)' }}>—</div>
            </div>
          ) : (
            <div key={item.label} style={{ padding: '20px 18px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: item.color, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.05em' }}>{item.sub}</div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/* ─── SDK Section ────────────────────────────────────────────────────────── */
function SDKSection() {
  const [tab, setTab] = useState<TabKey>('remember');
  const [copied, setCopied] = useState(false);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'remember', label: 'remember()' },
    { key: 'recall',   label: 'recall()' },
    { key: 'archive',  label: 'archive()' },
  ];

  const code: Record<TabKey, string> = {
    remember: `<span class="cm">// Write agent context to 0G Storage (KV + Log layers)</span>
<span class="kw">await</span> memory.<span class="fn">remember</span>(<span class="str">'client:acme'</span>, {
  budget:         <span class="num">50000</span>,
  preferredStack: <span class="str">'TypeScript'</span>,
  timezone:       <span class="str">'Asia/Singapore'</span>,
});
<span class="cm">// → KV write: on-chain stream tx</span>
<span class="cm">// → Log write: returns root hash</span>
<span class="cm">// → Local index: key → rootHash mapping</span>`,

    recall: `<span class="cm">// Retrieve context FROM 0G Storage (across sessions)</span>
<span class="kw">const</span> context = <span class="kw">await</span> memory.<span class="fn">recall</span>(<span class="str">'client:acme'</span>);
<span class="cm">// 1. Look up rootHash in local index</span>
<span class="cm">// 2. indexer.download(rootHash) → temp file</span>
<span class="cm">// 3. Parse JSON → return value</span>
<span class="cm">// No central server. Pure 0G network retrieval.</span>

<span class="kw">if</span> (context) {
  console.<span class="fn">log</span>(<span class="str">\`Budget: $\${context.budget}\`</span>);
}`,

    archive: `<span class="cm">// Archive record to 0G Storage Log (immutable)</span>
<span class="kw">const</span> { rootHash, storageScanUrl } =
  <span class="kw">await</span> memory.<span class="fn">archive</span>({
    type: <span class="str">'invoice'</span>,
    data: invoice,
  });

<span class="cm">// rootHash → permanent cryptographic proof</span>
console.<span class="fn">log</span>(storageScanUrl);
<span class="cm">// → https://storagescan.0g.ai/tx/0xbde826...</span>
<span class="cm">// Verifiable forever. Cannot be modified.</span>`,
  };

  const copy = () => {
    const el = document.querySelector('.code-block pre');
    if (el) navigator.clipboard.writeText(el.textContent ?? '').then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <section id="sdk" className="section">
      <div className="sec-hdr">
        <span className="sec-num">03</span>
        <h2>SDK <em>Reference</em></h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }} className="two-col">
        <div>
          <h3>Three methods. Complete memory.</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--gray-600)', marginBottom: 20 }}>
            The entire 0G-Memory API surface is three async methods.
            Initialize once with your 0G credentials, then drop it anywhere in your agent pipeline.
          </p>

          {[
            { fn: 'remember(key, value)',     color: P1, desc: 'Write to KV stream + Log layer. Returns root hash.' },
            { fn: 'recall(key)',              color: P2, desc: 'Retrieve from 0G Storage via root hash. Returns value or null.' },
            { fn: 'archive({ type, data })',  color: P3, desc: 'Append-only log write. Returns rootHash + StorageScan URL.' },
          ].map(m => (
            <div key={m.fn} className="card" style={{ marginBottom: 12, borderColor: m.color }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: m.color, marginBottom: 6 }}>{m.fn}</div>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>{m.desc}</p>
            </div>
          ))}

          <div className="hl" style={{ marginTop: 20 }}>
            <div>Works with any LLM framework. Initialize with your 0G credentials once — the same instance is reused across the agent&apos;s lifetime via a singleton pattern.</div>
          </div>
        </div>

        <div>
          <div className="tabs">
            {tabs.map(t => (
              <div key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </div>
            ))}
          </div>
          <div className="code-block" style={{ border: 'var(--border-lg)', borderTop: 'none' }}>
            <button className="copy-btn" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
            <pre dangerouslySetInnerHTML={{ __html: code[tab] }} style={{ whiteSpace: 'pre-wrap' }} />
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 8 }}>
              Initialization
            </div>
            <div className="code-block">
              <pre dangerouslySetInnerHTML={{ __html: `<span class="kw">import</span> { <span class="cls">ChainMemory</span> } <span class="kw">from</span> <span class="str">'chainmemory-sdk'</span>;

<span class="kw">const</span> memory = <span class="kw">new</span> <span class="cls">ChainMemory</span>({
  agentId:    <span class="str">'my-agent-v1'</span>,
  privateKey: process.env.<span class="cy">PRIVATE_KEY</span>,
  rpcUrl:     <span class="str">'https://evmrpc-testnet.0g.ai'</span>,
  indexerRpc: <span class="str">'https://indexer-storage-testnet-turbo.0g.ai'</span>,
});` }} style={{ whiteSpace: 'pre-wrap' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── AgentBill ──────────────────────────────────────────────────────────── */
function AgentBill() {
  const features = [
    { color: P1, title: '0G-Memory',  desc: 'Client history recalled across sessions from 0G Storage. Returning clients are surfaced automatically.' },
    { color: P2, title: '0G Compute', desc: 'Qwen inference via 0G Compute Router with TEE verification. Structured invoice generation from natural language.' },
    { color: P3, title: '0G Storage', desc: 'Every invoice archived permanently to 0G Storage Log layer. Root hash returned as cryptographic proof.' },
    { color: P4, title: '0G Chain',   desc: 'Payment escrow via AgentPayment.sol on 0G Chain (chainId 16602). ChainScan link on every invoice.' },
  ];

  return (
    <section id="agentbill" className="section">
      <div className="sec-hdr">
        <span className="sec-num">04</span>
        <h2>Built with 0G-Memory: <em>AgentBill</em></h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }} className="two-col">
        <div>
          <h3>Autonomous Invoice Agent</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--gray-600)', marginBottom: 20 }}>
            AgentBill is the first production application built on 0G-Memory.
            It demonstrates the full stack: an AI agent that remembers clients across sessions,
            generates invoices via 0G Compute, archives them permanently, and settles payments
            on 0G Chain.
          </p>

          <div className="hl" style={{ marginBottom: 24 }}>
            <div>
              <strong style={{ color: 'var(--white)' }}>The key demonstration:</strong>{' '}
              generate an invoice for a client, then generate a second one for the same client.
              The agent surfaces their full history — total invoiced, past jobs, invoice IDs —
              retrieved from 0G Storage, not a database.
            </div>
          </div>

          <Link href="/demo" className="btn-primary">Try AgentBill Demo</Link>
        </div>

        <div style={{ border: 'var(--border-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              style={{
                padding: '22px 20px',
                borderRight:  i % 2 === 0 ? 'var(--border-lg)' : 'none',
                borderBottom: i < 2       ? 'var(--border-lg)' : 'none',
                borderTop: `2px solid ${f.color}`,
                transition: 'background .15s',
                cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${f.color}07`)}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: f.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer>
      <div className="footer-logo mono">0G-MEMORY</div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gray-400)', letterSpacing: '0.06em', textAlign: 'center' }}>
        BUILT FOR 0G APAC HACKATHON 2026 · POWERED BY 0G STORAGE · COMPUTE · CHAIN
      </p>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link href="/demo" className="footer-link">AgentBill Demo</Link>
        <a href="#architecture" className="footer-link">Architecture</a>
        <a href="#sdk" className="footer-link">SDK</a>
      </div>
    </footer>
  );
}
