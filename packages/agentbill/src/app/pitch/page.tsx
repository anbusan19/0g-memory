'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { DottedGlobe } from '../components/DottedGlobe';

const TOTAL = 10;
const P1 = '#c966ff', P2 = '#a855f7', P3 = '#7c3aed', P4 = '#e879f9';

/* ─── Mini Neural Sprite (title slide) ─────────────────────────────────────── */
function MiniNeural() {
  const layers = [
    { x: 45,  ys: [78, 158, 238] },
    { x: 165, ys: [46, 106, 158, 210, 270] },
    { x: 295, ys: [46, 106, 158, 210, 270] },
    { x: 398, ys: [112, 204] },
  ];
  const edges: {x1:number;y1:number;x2:number;y2:number;k:string}[] = [];
  for (let li = 0; li < layers.length - 1; li++)
    for (const y1 of layers[li].ys)
      for (const y2 of layers[li+1].ys)
        edges.push({ x1:layers[li].x, y1, x2:layers[li+1].x, y2, k:`${li}-${y1}-${y2}` });

  const pulses = [
    {li:0,ni:0,lj:1,nj:1,dur:1.0,begin:0.0},{li:0,ni:1,lj:1,nj:3,dur:1.2,begin:0.8},
    {li:0,ni:2,lj:1,nj:2,dur:0.9,begin:1.7},{li:0,ni:0,lj:1,nj:4,dur:1.3,begin:2.4},
    {li:0,ni:1,lj:1,nj:0,dur:1.1,begin:0.4},{li:1,ni:0,lj:2,nj:2,dur:1.3,begin:0.3},
    {li:1,ni:2,lj:2,nj:1,dur:1.1,begin:1.0},{li:1,ni:3,lj:2,nj:3,dur:1.2,begin:0.7},
    {li:1,ni:4,lj:2,nj:4,dur:1.4,begin:1.9},{li:1,ni:1,lj:2,nj:0,dur:1.0,begin:3.1},
    {li:2,ni:1,lj:3,nj:0,dur:1.0,begin:0.5},{li:2,ni:3,lj:3,nj:1,dur:1.1,begin:1.4},
    {li:2,ni:2,lj:3,nj:0,dur:0.9,begin:2.2},{li:2,ni:4,lj:3,nj:1,dur:1.2,begin:0.2},
  ].map(p => ({
    x1:layers[p.li].x, y1:layers[p.li].ys[p.ni],
    x2:layers[p.lj].x, y2:layers[p.lj].ys[p.nj],
    dur:p.dur, begin:p.begin,
  }));

  return (
    <svg viewBox="0 0 440 316" style={{width:'100%',height:'auto',display:'block',maxHeight:316}} aria-hidden>
      <defs>
        <filter id="mn-ng" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="mn-dg" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="mn-rg" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="mn-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(201,102,255,0.06)"/>
          <stop offset="100%" stopColor="rgba(201,102,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="440" height="316" fill="url(#mn-bg)"/>
      {(['Input','Hidden','Hidden','Output'] as const).map((l,li) => (
        <text key={li} x={layers[li].x} y={306} textAnchor="middle"
          style={{fontFamily:'monospace',fontSize:7,fill:'rgba(201,102,255,0.38)',letterSpacing:'0.1em'}}>
          {l.toUpperCase()}
        </text>
      ))}
      {edges.map(e => <line key={e.k} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="rgba(201,102,255,0.1)" strokeWidth="0.65"/>)}
      {layers.map((layer,li) =>
        (li===0||li===3) ? layer.ys.map((y,ni) => {
          const b = ((li*2.1+ni*0.9)%3.2).toFixed(2);
          return [0,1.4].map((off,ri) => (
            <circle key={`r-${li}-${ni}-${ri}`} cx={layer.x} cy={y} r={6} fill="none" stroke="#c966ff" strokeWidth="0.8" filter="url(#mn-rg)">
              <animate attributeName="r" values="6;22" dur="2.2s" repeatCount="indefinite" begin={`${(+b+off).toFixed(2)}s`}/>
              <animate attributeName="opacity" values="0.5;0" dur="2.2s" repeatCount="indefinite" begin={`${(+b+off).toFixed(2)}s`}/>
            </circle>
          ));
        }) : null
      )}
      {pulses.map((p,i) => (
        <circle key={i} r={2.8} fill="#c966ff" filter="url(#mn-dg)">
          <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.begin}s`} path={`M ${p.x1},${p.y1} L ${p.x2},${p.y2}`}/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.07;0.93;1" dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.begin}s`}/>
        </circle>
      ))}
      {layers.map((layer,li) =>
        layer.ys.map((y,ni) => {
          const isIO=li===0||li===3, r=isIO?6.2:4.2;
          const from=isIO?'0.75':'0.38', dur=`${1.7+(ni%3)*0.52}s`;
          const beg=`${((li*2.1+ni*0.65)%3.3).toFixed(2)}s`;
          return (
            <circle key={`n-${li}-${ni}`} cx={layer.x} cy={y} r={r} fill="#c966ff" filter={isIO?'url(#mn-ng)':undefined}>
              <animate attributeName="opacity" values={`${from};1;${from}`} dur={dur} repeatCount="indefinite" begin={beg}/>
            </circle>
          );
        })
      )}
    </svg>
  );
}

/* ─── Slide header bar (non-title slides) ──────────────────────────────────── */
function SlideHeader({ n }: { n: number }) {
  return (
    <div style={{
      height:54, borderBottom:'var(--border-lg)', display:'flex',
      alignItems:'center', padding:'0 72px', justifyContent:'space-between', flexShrink:0,
    }}>
      <div style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,color:'var(--og-green)',letterSpacing:'0.1em'}}>
        0G-MEMORY
      </div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'rgba(13,13,13,0.28)',letterSpacing:'0.14em'}}>
        {String(n).padStart(2,'0')} / {String(TOTAL).padStart(2,'0')}
      </div>
    </div>
  );
}

/* ─── Content wrapper ───────────────────────────────────────────────────────── */
function Content({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'28px 72px 40px', overflow:'hidden', ...style }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SLIDES
══════════════════════════════════════════════════════════════════════════════ */

/* 01 — TITLE */
function S01Title() {
  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Nav bar */}
      <div style={{height:52,borderBottom:'var(--border-lg)',display:'flex',alignItems:'stretch',flexShrink:0}}>
        <div className="nav-logo">
          <div className="nav-dot"><span/><span/><span/><span/></div>
          0G-MEMORY
        </div>
        <div style={{flex:1,display:'flex',alignItems:'center',padding:'0 24px'}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--gray-400)',letterSpacing:'0.06em'}}>/ pitch deck</span>
        </div>
        <Link href="/" className="nav-link">Back to site</Link>
        <Link href="/demo" className="nav-link" style={{borderRight:'none'}}>Live demo</Link>
      </div>

      {/* Split */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'55% 45%',overflow:'hidden'}}>
        {/* Left */}
        <div style={{padding:'48px 72px',display:'flex',flexDirection:'column',justifyContent:'center',borderRight:'var(--border-lg)'}}>
          <div className="eyebrow" style={{marginBottom:20}}>0G APAC Hackathon 2026</div>
          <h1 className="pitch-h1" style={{marginBottom:20}}>
            Persistent<br/><em>Memory</em> for<br/>AI Agents.
          </h1>
          <p className="pitch-body" style={{maxWidth:'52ch',marginBottom:32}}>
            A drop-in SDK giving autonomous agents verifiable, cross-session memory
            backed by 0G Storage — KV for fast context, Log for immutable archival,
            0G Chain for on-chain settlement.
          </p>

          {/* Stat pills */}
          <div style={{display:'flex',gap:0,marginBottom:32}}>
            {[
              {val:'3',     label:'SDK Methods'},
              {val:'Live',  label:'0G Testnet'},
              {val:'E2E',   label:'Working Demo'},
            ].map((s,i) => (
              <div key={s.label} style={{
                border:'var(--border-lg)', padding:'14px 24px',
                marginLeft: i > 0 ? -1.5 : 0,
                background: i===0 ? 'var(--off)' : 'var(--surface)',
              }}>
                <div style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:28,color:'var(--og-green)',lineHeight:1,marginBottom:4}}>
                  {s.val}
                </div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--gray-400)',letterSpacing:'0.08em',textTransform:'uppercase'}}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{display:'flex'}}>
            <Link href="/demo" className="btn-primary">Try AgentBill Demo</Link>
            <a href="#" className="btn-outline" onClick={e => e.preventDefault()}>0G APAC Hackathon</a>
          </div>
        </div>

        {/* Right */}
        <div style={{background:'var(--surface)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 36px',gap:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,alignSelf:'flex-start'}}>
            <div className="live-dot"/>
            <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--gray-400)',letterSpacing:'0.1em',textTransform:'uppercase'}}>0G Network</span>
          </div>
          <DottedGlobe maxHeight={320}/>
        </div>
      </div>
    </div>
  );
}

/* 02 — THE PROBLEM */
function S02Problem() {
  return (
    <>
      <SlideHeader n={2}/>
      <Content>
        <div className="pitch-kicker">01 — The Problem</div>
        <h2 className="pitch-h2" style={{marginBottom:12}}>AI agents are <em>amnesiac</em><br/>by design.</h2>
        <p className="pitch-body" style={{maxWidth:'58ch',marginBottom:28}}>
          Every session starts cold. Client context is lost. There is no proof the stored data
          was not modified. Memory lives in centralized databases that agents cannot outlive.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {/* TODAY */}
          <div style={{border:'var(--border-lg)',borderTop:'2.5px solid #dc2626',background:'var(--surface)',padding:'22px 24px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'#dc2626',fontWeight:700,marginBottom:16}}>Today</div>
            {[
              'Agent stores state to Postgres/Redis',
              'Session ends — context permanently wiped',
              'New session starts cold, client unrecognized',
              'No cryptographic proof of data integrity',
              'Vendor lock-in — entire memory held hostage',
            ].map((t,i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10,fontSize:13,color:'var(--gray-600)',lineHeight:1.5}}>
                <span style={{color:'#dc2626',fontFamily:'var(--font-mono)',fontWeight:700,flexShrink:0,marginTop:1}}>✗</span>
                {t}
              </div>
            ))}
          </div>

          {/* WITH 0G-MEMORY */}
          <div style={{border:'var(--border-lg)',borderTop:`2.5px solid ${P1}`,background:'var(--surface)',padding:'22px 24px'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:P1,fontWeight:700,marginBottom:16}}>With 0G-Memory</div>
            {[
              'memory.remember() writes to 0G Storage (KV + Log)',
              'Session ends — Merkle root hash persists forever',
              'New session: recall() retrieves full context from 0G',
              'Root hash on StorageScan — verifiable by anyone',
              'Decentralized — no vendor, no lock-in, no single point of failure',
            ].map((t,i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10,fontSize:13,color:'var(--gray-600)',lineHeight:1.5}}>
                <span style={{color:P1,fontFamily:'var(--font-mono)',fontWeight:700,flexShrink:0,marginTop:1}}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </Content>
    </>
  );
}

/* 03 — THE SOLUTION */
function S03Solution() {
  return (
    <>
      <SlideHeader n={3}/>
      <Content>
        <div className="pitch-kicker">02 — The Solution</div>
        <h2 className="pitch-h2" style={{marginBottom:10}}>Three methods.<br/><em>Complete memory.</em></h2>
        <p className="pitch-body" style={{maxWidth:'60ch',marginBottom:32}}>
          Initialize once with your 0G credentials. Drop into any agent pipeline.
          The SDK handles KV writes, Log archival, and local root-hash indexing transparently.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0}}>
          {[
            {color:P1, method:'remember(key, value)', tag:'Write',
              what:'Writes to KV stream (fast reads) and Log layer (root hash). Returns the Merkle root hash as cryptographic proof.',
              code:'await memory.remember(\'client:acme\', { budget: 50000 });'},
            {color:P2, method:'recall(key)', tag:'Read',
              what:'Looks up the root hash in the local index, then downloads the file directly from 0G Storage network. No central server.',
              code:'const ctx = await memory.recall(\'client:acme\');'},
            {color:P3, method:'archive({ type, data })', tag:'Archive',
              what:'Append-only write to 0G Storage Log layer. Returns rootHash and a StorageScan URL — a permanent, tamper-proof record.',
              code:'const { rootHash } = await memory.archive({ type: \'invoice\', data });'},
          ].map((m,i) => (
            <div key={m.method} style={{
              border:'var(--border-lg)', borderLeft: i>0 ? 'none' : 'var(--border-lg)',
              borderTop:`3px solid ${m.color}`, padding:'22px 22px',
              background:'var(--surface)',
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:8,letterSpacing:'0.1em',textTransform:'uppercase',color:m.color}}>{m.tag}</span>
              </div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:13,color:m.color,fontWeight:700,marginBottom:10}}>{m.method}</div>
              <p style={{fontSize:13,color:'var(--gray-600)',lineHeight:1.6,marginBottom:14}}>{m.what}</p>
              <div style={{background:'#0e0518',padding:'8px 12px',borderLeft:`2px solid ${m.color}`}}>
                <code style={{fontFamily:'var(--font-mono)',fontSize:10,color:'rgba(240,237,232,0.7)',lineHeight:1.7}}>{m.code}</code>
              </div>
            </div>
          ))}
        </div>
      </Content>
    </>
  );
}

/* 04 — ARCHITECTURE */
function S04Architecture() {
  const layers = [
    {color:P1, num:'01', name:'KV Layer', sub:'Fast reads · Overwritable', methods:'remember() · recall()', detail:'Agent context, client profiles, and session state. Key-value pairs written to 0G\'s KV stream. Indexed by keccak256(agentId).'},
    {color:P2, num:'02', name:'Storage Log', sub:'Immutable · Append-only', methods:'archive()', detail:'Invoices, events, audit trails. Files return a Merkle root hash. Data cannot be modified after upload. StorageScan link for every record.'},
    {color:P3, num:'03', name:'0G Chain', sub:'Escrow · Settlement', methods:'registerInvoice() · pay() · release()', detail:'AgentPayment.sol anchors invoice IDs and root hashes on-chain. Clients pay into escrow. Release on delivery. ChainScan proof on every invoice.'},
  ];
  return (
    <>
      <SlideHeader n={4}/>
      <Content style={{padding:'28px 72px 40px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.05fr',gap:40,alignItems:'start'}}>
          <div>
            <div className="pitch-kicker">03 — Architecture</div>
            <h2 className="pitch-h2" style={{marginBottom:24}}>Three layers.<br/><em>One stack.</em></h2>

            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {layers.map((l,i) => (
                <div key={l.num}>
                  <div style={{border:'var(--border-lg)',borderLeft:`3px solid ${l.color}`,padding:'14px 18px',background:'var(--surface)',marginTop: i===0 ? 0 : -1.5}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:l.color,fontWeight:700,letterSpacing:'0.1em'}}>{l.num}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,color:'var(--white)'}}>{l.name}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--gray-400)'}}>{l.sub}</span>
                    </div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:l.color,marginBottom:4}}>{l.methods}</div>
                    <p style={{fontSize:12,color:'var(--gray-600)',lineHeight:1.5}}>{l.detail}</p>
                  </div>
                  {i < 2 && (
                    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:14,gap:5}}>
                      {[P1,P2,P3].map((c,j) => <div key={j} className="flow-dot" style={{background:c,animationDelay:`${j*0.3}s`}}/>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gray-400)',marginBottom:8}}>SDK Initialization</div>
            <div className="code-block" style={{fontSize:12}}>
              <pre style={{whiteSpace:'pre-wrap'}} dangerouslySetInnerHTML={{__html:
`<span class="kw">import</span> { <span class="cls">ChainMemory</span> } <span class="kw">from</span> <span class="str">'chainmemory-sdk'</span>;

<span class="kw">const</span> memory = <span class="kw">new</span> <span class="cls">ChainMemory</span>({
  agentId:    <span class="str">'my-agent-v1'</span>,
  privateKey: process.env.<span class="cy">PRIVATE_KEY</span>,
  rpcUrl:     <span class="str">'https://evmrpc-testnet.0g.ai'</span>,
  indexerRpc: <span class="str">'https://indexer-storage-testnet-turbo.0g.ai'</span>,
});

<span class="cm">// Write to KV + Log → root hash returned</span>
<span class="kw">await</span> memory.<span class="fn">remember</span>(<span class="str">'client:acme'</span>, { budget: <span class="num">50000</span> });

<span class="cm">// Retrieve from 0G network via root hash</span>
<span class="kw">const</span> ctx = <span class="kw">await</span> memory.<span class="fn">recall</span>(<span class="str">'client:acme'</span>);

<span class="cm">// Immutable log → StorageScan URL</span>
<span class="kw">const</span> { rootHash } = <span class="kw">await</span> memory.<span class="fn">archive</span>({
  type: <span class="str">'invoice'</span>, data: invoice,
});`
              }}/>
            </div>
          </div>
        </div>
      </Content>
    </>
  );
}

/* 05 — HOW IT WORKS */
function S05HowItWorks() {
  const steps = [
    {n:'01',color:P1,title:'Agent calls\nremember()',     sub:'kv + log write',    body:'Data submitted to 0G KV stream. Full record uploaded to 0G Storage Log layer.'},
    {n:'02',color:P2,title:'0G Storage\nconfirms',       sub:'distributed + hashed',body:'Network distributes data across nodes. Merkle root hash computed and returned.'},
    {n:'03',color:P3,title:'Root hash\nsaved locally',   sub:'key → rootHash index', body:'A tiny local index maps key → rootHash. The index is the only centralized piece.'},
    {n:'04',color:P4,title:'Any session\ncalls recall()', sub:'0g network retrieval', body:'Local index resolves the root hash. indexer.download() fetches the file from 0G.'},
    {n:'05',color:P1,title:'On-chain\nrecord (invoice)', sub:'agentpayment.sol',    body:'registerInvoice() anchors invoice ID + rootHash on 0G Chain. ChainScan proof link.'},
  ];
  return (
    <>
      <SlideHeader n={5}/>
      <Content>
        <div className="pitch-kicker">04 — How It Works</div>
        <h2 className="pitch-h2" style={{marginBottom:28}}>From description<br/>to <em>on-chain proof.</em></h2>

        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:0}}>
          {steps.map((s,i) => (
            <div key={s.n} style={{display:'flex',flexDirection:'column'}}>
              <div style={{
                border:'var(--border-lg)', borderLeft: i>0 ? 'none' : 'var(--border-lg)',
                padding:'18px 16px', flex:1,
                borderTop:`3px solid ${s.color}`,
                background: i%2===0 ? 'var(--surface)' : 'var(--off)',
              }}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:28,fontWeight:700,color:s.color,opacity:0.25,lineHeight:1,marginBottom:10}}>{s.n}</div>
                <div style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:15,color:'var(--white)',lineHeight:1.2,marginBottom:6,whiteSpace:'pre-line'}}>{s.title}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:8,color:s.color,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>{s.sub}</div>
                <p style={{fontSize:12,color:'var(--gray-600)',lineHeight:1.55}}>{s.body}</p>
              </div>
              {i < 4 && (
                <div style={{position:'relative',height:0,overflow:'visible',display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
                  <div style={{
                    position:'absolute',right:-12,top:-24,
                    fontFamily:'var(--font-mono)',fontSize:12,
                    color:s.color,zIndex:2,
                    background:'var(--bg)',padding:'2px',
                  }}>—</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Content>
    </>
  );
}

/* 06 — AGENTBILL */
function S06AgentBill() {
  const features = [
    {color:P1,title:'0G-Memory',  desc:'Client history recalled from 0G Storage on every session. Returning clients recognised automatically — no database query.'},
    {color:P2,title:'0G Compute', desc:'Natural language job description parsed by Qwen-2.5-7B via 0G Compute Router. TEE verified inference.'},
    {color:P3,title:'0G Storage', desc:'Every invoice archived to 0G Storage Log. Root hash proof returned. Verifiable forever on StorageScan.'},
    {color:P4,title:'0G Chain',   desc:'AgentPayment.sol on chainId 16602. Invoice registered on-chain. Escrow + release. ChainScan link on every invoice.'},
  ];
  return (
    <>
      <SlideHeader n={6}/>
      <Content>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:48,alignItems:'start'}}>
          <div>
            <div className="pitch-kicker">05 — AgentBill</div>
            <h2 className="pitch-h2" style={{marginBottom:14}}>The first app<br/>built on <em>0G-Memory.</em></h2>
            <p className="pitch-body" style={{maxWidth:'46ch',marginBottom:20}}>
              An autonomous invoicing agent that demonstrates the complete 0G stack.
              Describe your work — it generates, archives, and registers an invoice entirely on-chain.
            </p>
            <div className="hl" style={{marginBottom:24}}>
              <div style={{fontSize:13}}>
                <strong style={{color:'var(--white)'}}>The key moment:</strong> generate an invoice for a returning client.
                The agent surfaces their full history — total invoiced, past jobs, invoice IDs — retrieved live from 0G Storage,
                not a database.
              </div>
            </div>
            <Link href="/demo" className="btn-primary">Try the Live Demo</Link>
          </div>

          <div style={{border:'var(--border-lg)',display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            {features.map((f,i) => (
              <div key={f.title} style={{
                padding:'20px 18px',
                borderRight:  i%2===0 ? 'var(--border-lg)' : 'none',
                borderBottom: i<2     ? 'var(--border-lg)' : 'none',
                borderTop:`2px solid ${f.color}`,
                background:'var(--surface)',
              }}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,fontWeight:700,color:f.color,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:8}}>{f.title}</div>
                <p style={{fontSize:12,color:'var(--gray-600)',lineHeight:1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Content>
    </>
  );
}

/* 07 — MARKET */
function S07Market() {
  const cols = [
    {color:P1, label:'All AI Agents', tag:'Total Addressable',
     points:['Every LLM pipeline needs state','Framework-agnostic SDK','40%+ YoY agent market growth'],
     highlight:'Any agent that calls an LLM and needs to remember its output.'},
    {color:P2, label:'Agentic Services', tag:'Serviceable Addressable',
     points:['Autonomous workflow agents','Compliance-grade memory','Cross-session context required'],
     highlight:'Agents deployed in production that interact with real users over time.'},
    {color:P3, label:'0G-Native Agents', tag:'Serviceable Obtainable',
     points:['Web3-first AI projects','DeFi + AI convergence','First-mover on 0G Network'],
     highlight:'Projects building on 0G who need memory and payment infrastructure today.'},
  ];
  return (
    <>
      <SlideHeader n={7}/>
      <Content>
        <div className="pitch-kicker">06 — Market</div>
        <h2 className="pitch-h2" style={{marginBottom:28}}>The AI agent economy<br/>needs <em>infrastructure.</em></h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0}}>
          {cols.map((c,i) => (
            <div key={c.label} style={{
              border:'var(--border-lg)', borderLeft: i>0 ? 'none' : 'var(--border-lg)',
              borderTop:`3px solid ${c.color}`, padding:'22px 22px',
              background: i===2 ? 'var(--off)' : 'var(--surface)',
            }}>
              <div style={{fontFamily:'var(--font-mono)',fontSize:8,letterSpacing:'0.1em',textTransform:'uppercase',color:c.color,marginBottom:6}}>{c.tag}</div>
              <div style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:22,color:'var(--white)',marginBottom:16,lineHeight:1.1}}>{c.label}</div>
              {c.points.map((p,pi) => (
                <div key={pi} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,fontSize:13,color:'var(--gray-600)'}}>
                  <span style={{color:c.color,fontWeight:700,flexShrink:0}}>—</span>{p}
                </div>
              ))}
              <div style={{marginTop:14,padding:'10px 14px',background:'var(--bg)',border:'var(--border-lg)',borderLeft:`2px solid ${c.color}`,fontSize:12,color:'var(--gray-600)',lineHeight:1.5}}>
                {c.highlight}
              </div>
            </div>
          ))}
        </div>
      </Content>
    </>
  );
}

/* 08 — COMPETITION */
function S08Competition() {
  const headers = ['','PostgreSQL / Redis','IPFS / Filecoin','LLM Context Window','0G-Memory'];
  const rows = [
    ['Persistent memory',       '✓','✓','✗','✓'],
    ['Cryptographic proof',     '✗','✓','✗','✓'],
    ['Decentralized storage',   '✗','✓','✗','✓'],
    ['Agent SDK (3 methods)',   '✓','✗','✗','✓'],
    ['On-chain settlement',     '✗','✗','✗','✓'],
    ['Vendor lock-in',          'High','Low','None','None'],
  ];
  const colW = ['200px','1fr','1fr','1fr','1fr'];
  const color = (v:string, ci:number) => {
    if (ci===4) return v==='✓'?P1:v==='✗'?'#dc2626':P1;
    if (v==='✓') return '#16a34a';
    if (v==='✗') return '#dc2626';
    if (v==='High') return '#dc2626';
    return 'var(--gray-600)';
  };
  return (
    <>
      <SlideHeader n={8}/>
      <Content>
        <div className="pitch-kicker">07 — Competition</div>
        <h2 className="pitch-h2" style={{marginBottom:24}}>Every alternative<br/>misses <em>at least one.</em></h2>
        <div style={{border:'var(--border-lg)'}}>
          {/* Header row */}
          <div style={{display:'grid',gridTemplateColumns:colW.join(' '),borderBottom:'var(--border-lg)',background:'var(--off)'}}>
            {headers.map((h,ci) => (
              <div key={ci} style={{
                padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:9.5,
                fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
                borderRight: ci<4 ? 'var(--border-lg)' : 'none',
                color: ci===4 ? P1 : 'var(--white)',
                background: ci===4 ? 'rgba(201,102,255,0.06)' : 'transparent',
              }}>{h}</div>
            ))}
          </div>
          {rows.map((row,ri) => (
            <div key={ri} style={{display:'grid',gridTemplateColumns:colW.join(' '),borderBottom:ri<rows.length-1?'var(--border)':'none'}}>
              {row.map((cell,ci) => (
                <div key={ci} style={{
                  padding:'11px 14px', fontFamily:'var(--font-mono)', fontSize:11,
                  borderRight: ci<4 ? 'var(--border)' : 'none',
                  color: color(cell,ci),
                  fontWeight: (cell==='✓'||cell==='✗') ? 700 : 400,
                  background: ci===4 ? 'rgba(201,102,255,0.04)' : 'transparent',
                }}>{cell}</div>
              ))}
            </div>
          ))}
        </div>
        <p className="pitch-body" style={{marginTop:16,fontSize:13}}>
          0G-Memory is the only solution combining a developer-friendly agent SDK with decentralized,
          verifiable storage and native on-chain payment settlement — all on a single unified network.
        </p>
      </Content>
    </>
  );
}

/* 09 — TRACTION */
function S09Traction() {
  const metrics = [
    {color:P1, label:'chainmemory-sdk', val:'3 Methods', detail:'remember · recall · archive — complete API surface. TypeScript, tested end-to-end.'},
    {color:P2, label:'AgentBill Demo',  val:'Live',      detail:'Full pipeline: AI inference → storage archive → chain registration. Working on 0G testnet.'},
    {color:P3, label:'0G Compute',      val:'TEE',       detail:'Qwen-2.5-7B via 0G Compute Router. TEE-verified inference. Invoice generation from natural language.'},
    {color:P4, label:'0G Storage',      val:'KV + Log',  detail:'Both layers integrated. KV for fast context, Log for immutable invoices with root hash proof.'},
    {color:P1, label:'0G Chain',        val:'16602',     detail:'AgentPayment.sol deployed on 0G Chain testnet (chainId 16602). registerInvoice · pay · release.'},
    {color:P2, label:'End-to-End',      val:'100%',      detail:'All steps verified: AI parses → 0G stores → root hash → chain registers → ChainScan link returned.'},
  ];
  return (
    <>
      <SlideHeader n={9}/>
      <Content>
        <div className="pitch-kicker">08 — Traction</div>
        <h2 className="pitch-h2" style={{marginBottom:28}}>Everything working<br/>on <em>0G Testnet.</em></h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0}}>
          {metrics.map((m,i) => {
            const br = i%3<2 ? 'var(--border-lg)' : 'none';
            const bb = i<3 ? 'var(--border-lg)' : 'none';
            return (
              <div key={m.label} style={{
                border:'var(--border-lg)',
                borderRight:br, borderBottom:bb,
                borderLeft: i%3===0 ? 'var(--border-lg)' : 'none',
                borderTop: i<3 ? `2px solid ${m.color}` : 'none',
                padding:'20px 22px', background:'var(--surface)',
              }}>
                <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gray-400)'}}>{m.label}</span>
                  <span style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:22,color:m.color,lineHeight:1}}>{m.val}</span>
                </div>
                <p style={{fontSize:12,color:'var(--gray-600)',lineHeight:1.55}}>{m.detail}</p>
              </div>
            );
          })}
        </div>
      </Content>
    </>
  );
}

/* 10 — ASK / CLOSE */
function S10Ask() {
  const built = [
    'chainmemory-sdk — 3 methods, TypeScript, tested',
    'AgentBill — Next.js 14 frontend, live demo at /demo',
    'AgentPayment.sol — deployed on 0G Chain (chainId 16602)',
    'Full pipeline verified end-to-end on 0G testnet',
    '0G Compute (Qwen-2.5-7B) + 0G Storage (KV + Log)',
  ];
  const next = [
    'Mainnet deployment across 0G Storage + Chain',
    'npm registry publish of chainmemory-sdk',
    'LangChain / AutoGPT integration plugin',
    'Multi-agent shared memory coordination',
    'Browser-based agent demo with live memory panel',
  ];
  return (
    <>
      <SlideHeader n={10}/>
      <Content>
        <div className="pitch-kicker">09 — Built for 0G APAC Hackathon 2026</div>
        <h2 className="pitch-h2" style={{marginBottom:32}}><em>Live today.</em><br/>On-chain tomorrow.</h2>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,marginBottom:32}}>
          {/* What's live */}
          <div style={{border:'var(--border-lg)',borderTop:`2px solid ${P1}`,padding:'22px 24px',background:'var(--off)'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:P1,fontWeight:700,marginBottom:16}}>What is live</div>
            {built.map((t,i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10,fontSize:13,color:'var(--gray-600)',lineHeight:1.5}}>
                <span style={{color:P1,fontFamily:'var(--font-mono)',fontWeight:700,flexShrink:0}}>✓</span>{t}
              </div>
            ))}
          </div>

          {/* What's next */}
          <div style={{border:'var(--border-lg)',borderLeft:'none',borderTop:`2px solid ${P3}`,padding:'22px 24px',background:'var(--surface)'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:P3,fontWeight:700,marginBottom:16}}>What is next</div>
            {next.map((t,i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10,fontSize:13,color:'var(--gray-600)',lineHeight:1.5}}>
                <span style={{color:P3,fontFamily:'var(--font-mono)',fontWeight:700,flexShrink:0}}>—</span>{t}
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p className="pitch-body" style={{fontSize:13,maxWidth:'52ch'}}>
              Built in 48 hours for the 0G APAC Hackathon 2026. Every component is deployed and working.
              The demo is live — try it now.
            </p>
          </div>
          <div style={{display:'flex',gap:0,flexShrink:0}}>
            <Link href="/demo" className="btn-primary" style={{fontSize:12}}>Try AgentBill Demo</Link>
            <Link href="/" className="btn-outline" style={{fontSize:12}}>Back to 0G-Memory</Link>
          </div>
        </div>
      </Content>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN CONTROLLER
══════════════════════════════════════════════════════════════════════════════ */
const SLIDES = [S01Title, S02Problem, S03Solution, S04Architecture, S05HowItWorks, S06AgentBill, S07Market, S08Competition, S09Traction, S10Ask];

export default function PitchPage() {
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((i: number) => {
    const target = Math.max(0, Math.min(TOTAL - 1, i));
    const slide = scrollRef.current?.children[target] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5)
          setIdx(parseInt((e.target as HTMLElement).dataset.idx || '0'));
      }),
      { root: container, threshold: 0.5 }
    );
    Array.from(container.children).forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(idx + 1); }
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(idx - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, goTo]);

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Progress dots */}
      <div style={{ position:'fixed', right:18, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:8, zIndex:50 }}>
        {Array.from({ length: TOTAL }).map((_,i) => (
          <button key={i} onClick={() => goTo(i)} className={`p-dot${i===idx?' active':''}`} aria-label={`Slide ${i+1}`}/>
        ))}
      </div>

      {/* Key hint */}
      <div className="pitch-key-hint" style={{
        position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
        fontFamily:'var(--font-mono)', fontSize:10, color:'rgba(13,13,13,0.3)',
        display:'flex', alignItems:'center', gap:8, pointerEvents:'none', zIndex:50,
        letterSpacing:'0.06em',
      }}>
        <kbd style={{background:'var(--off)',border:'var(--border-lg)',padding:'2px 7px',fontSize:10}}>↑</kbd>
        <kbd style={{background:'var(--off)',border:'var(--border-lg)',padding:'2px 7px',fontSize:10}}>↓</kbd>
        to navigate
      </div>

      {/* Slides */}
      <div ref={scrollRef} className="pitch-scroller">
        {SLIDES.map((Comp, i) => (
          <div key={i} data-idx={i} className="pitch-slide">
            <Comp/>
          </div>
        ))}
      </div>
    </div>
  );
}
