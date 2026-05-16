![0G-Memory](../../readmebanner.png)

# 0G-Memory SDK

[![npm version](https://img.shields.io/npm/v/0g-memory-sdk)](https://www.npmjs.com/package/0g-memory-sdk)
[![license](https://img.shields.io/npm/l/0g-memory-sdk)](./LICENSE)

Persistent, verifiable memory for AI agents — backed by [0G Storage](https://0g.ai) (KV + Log layers) and 0G Chain.

Agents built with this SDK remember clients, context, and history across sessions — from any machine, without a database.

```bash
npm install 0g-memory-sdk
```

---

## Why

AI agents forget everything when a session ends. Context lives in RAM, databases owned by third parties, or not at all. There is no cryptographic proof that stored data was not modified.

`0g-memory-sdk` gives any agent three primitives that run entirely on the 0G decentralized network:

| Method | What it does |
|---|---|
| `remember(key, value)` | Writes permanently to 0G Log (immutable, Merkle-provable) and registers a `key → rootHash` pointer in 0G KV so it is retrievable from any machine |
| `recall(key)` | Resolves the key via the KV index, fetches the value from the Log layer |
| `archive(record)` | Writes typed business records and returns a [StorageScan](https://storagescan-galileo.0g.ai) URL as a verifiable on-chain proof |

Because the key index lives on 0G — not on disk — any agent instance with the same private key and `agentId` gets full memory across machines, restarts, and serverless deployments.

---

## Quick start

```ts
import { ZeroGMemory, deriveAgentId } from '0g-memory-sdk';

const { agentId } = deriveAgentId('my-agent', process.env.PRIVATE_KEY!);

const memory = new ZeroGMemory({
  agentId,
  privateKey: process.env.PRIVATE_KEY!,
  rpcUrl:     'https://evmrpc-testnet.0g.ai',
  indexerRpc: 'https://indexer-storage-testnet-standard.0g.ai',
});

// Store something
const rootHash = await memory.remember('user:alice', { plan: 'pro', credits: 42 });

// Retrieve later — from any machine
const data = await memory.recall('user:alice');
// → { plan: 'pro', credits: 42 }

// Or retrieve immediately by root hash (before KV index settles on-chain)
const same = await memory.recallByHash(rootHash);
```

> **Testnet tokens:** Get OG from the [0G faucet](https://faucet.0g.ai) to pay for storage transactions.

---

## API

### `new ZeroGMemory(config)`

```ts
const memory = new ZeroGMemory({
  agentId:    string,  // unique agent identifier — use deriveAgentId()
  privateKey: string,  // wallet private key, pays for 0G storage txs
  rpcUrl:     string,  // 0G chain RPC endpoint
  indexerRpc: string,  // 0G storage indexer endpoint
});
```

`ChainMemory` is exported as an alias of `ZeroGMemory` for backward compatibility.

---

### `memory.remember(key, value) → Promise<string>`

Writes `value` to the 0G Log layer (permanent, content-addressed) and fires a concurrent KV write to register `key → rootHash` in the distributed index. Returns the root hash.

```ts
const rootHash = await memory.remember('session:xyz', {
  messages: [...],
  summary: 'User asked about pricing.',
});
```

The KV index write settles within a few 0G blocks. Use `recallByHash(rootHash)` for same-request access before it settles.

---

### `memory.recall(key) → Promise<unknown | null>`

Looks up `key` in the 0G KV index, then fetches the value from the Log layer. Returns `null` if the key was never written or the KV index has not yet settled.

Falls back automatically to the legacy local-file index (`.chainmemory/`) for data written by earlier SDK versions, and migrates those entries to KV on first access.

```ts
const context = await memory.recall('session:xyz');
if (context) {
  // resume where the agent left off
}
```

---

### `memory.recallByHash(rootHash) → Promise<unknown | null>`

Fetches a value directly from the 0G Log layer by its root hash, bypassing the KV index entirely. Use this immediately after `remember()` when you cannot wait for the index to settle.

```ts
const rootHash = await memory.remember('key', data);
const same     = await memory.recallByHash(rootHash); // always consistent
```

---

### `memory.archive(record) → Promise<{ rootHash, storageScanUrl }>`

Writes a typed, permanent record to the 0G Log layer. Returns the content-address root hash and a [StorageScan](https://storagescan-galileo.0g.ai) explorer URL that anyone can use to verify the data was not modified.

```ts
const { rootHash, storageScanUrl } = await memory.archive({
  type: 'invoice',   // 'invoice' | 'payment' | 'interaction' | 'custom'
  data: invoice,
});

console.log(storageScanUrl);
// https://storagescan-galileo.0g.ai/tx/0xabc...
```

---

### `memory.updateClientContext(clientName, context) → Promise<string>`

Convenience wrapper that normalises `clientName` to a key (`client:<name>`) and calls `remember()`. Designed for agents that serve multiple clients and need per-client persistent state. Returns the root hash.

```ts
const rootHash = await memory.updateClientContext('Alice Johnson', {
  totalInvoiced: 4200,
  invoiceCount:  3,
  lastJobDescription: 'Frontend redesign — 40 hrs at $120/hr',
});

// Recall in a future session:
const alice = await memory.recall('client:alice_johnson');
```

---

### `deriveAgentId(name, privateKey) → AgentIdentity`

Derives a deterministic, collision-resistant agent ID from a human-readable name and a wallet private key. Format: `<name>:<first-8-hex-chars-of-address>`.

```ts
import { deriveAgentId } from '0g-memory-sdk';

const { agentId, walletAddress } = deriveAgentId('billing-agent', process.env.PRIVATE_KEY!);
// agentId:       "billing-agent:a3f8c201"
// walletAddress: "0xA3F8..."
```

### `isValidAgentId(agentId) → boolean`

Validates that a string matches the `<name>:<8-hex-chars>` format.

---

## Configuration reference

| Field | Description | Testnet value |
|---|---|---|
| `agentId` | Unique agent identifier | `deriveAgentId('my-agent', privateKey).agentId` |
| `privateKey` | Wallet private key — pays gas and storage fees | Your Galileo testnet key |
| `rpcUrl` | 0G chain JSON-RPC endpoint | `https://evmrpc-testnet.0g.ai` |
| `indexerRpc` | 0G storage indexer endpoint | `https://indexer-storage-testnet-standard.0g.ai` |

---

## Patterns

### Session memory across restarts

```ts
async function chat(sessionId: string, userMessage: string) {
  const history = (await memory.recall(`session:${sessionId}`)) as Message[] ?? [];

  const reply = await llm.complete([
    ...history,
    { role: 'user', content: userMessage },
  ]);

  await memory.remember(`session:${sessionId}`, [
    ...history,
    { role: 'user',      content: userMessage },
    { role: 'assistant', content: reply },
  ]);

  return reply;
}
```

### Returning-client detection

```ts
async function greet(clientName: string) {
  const ctx = await memory.recall(`client:${clientName.toLowerCase()}`);
  return ctx
    ? `Welcome back — you've invoiced $${ctx.totalInvoiced} across ${ctx.invoiceCount} jobs.`
    : `Welcome! Let's set up your first invoice.`;
}
```

### Verifiable audit trail

```ts
const { rootHash, storageScanUrl } = await memory.archive({
  type: 'invoice',
  data: { id: 'INV-042', client: 'Acme Corp', total: 6000, currency: 'USD' },
});

// Share storageScanUrl — anyone can verify the invoice was not tampered with
```

### LangChain / agent framework integration

```ts
import { ZeroGMemory, deriveAgentId } from '0g-memory-sdk';

const { agentId } = deriveAgentId('langchain-agent', process.env.PRIVATE_KEY!);
const memory = new ZeroGMemory({ agentId, privateKey: ..., rpcUrl: ..., indexerRpc: ... });

// Use as a custom memory store
const loadMemory = async (key: string) => memory.recall(key);
const saveMemory = async (key: string, value: unknown) => memory.remember(key, value);
```

---

## Consistency model

| Pattern | Consistency | When to use |
|---|---|---|
| `remember()` → `recallByHash()` | Immediate | Same request, same session |
| `remember()` → `recall()` | Eventual (few blocks, ~seconds) | Cross-session, cross-machine |
| `archive()` | Write-once, permanent | Invoices, audit trails, proof records |

`recall()` automatically falls back to the local `.chainmemory/` index for data written by older SDK versions and migrates those entries to the KV layer transparently.

---

## Reference application

**AgentBill** is the reference implementation — an autonomous invoicing agent built with this SDK on the full 0G stack:

- **0G Compute** — Qwen-2.5-7B parses natural-language job descriptions into structured invoices
- **0G Memory** — per-client context recalled across sessions via `recall()` / `updateClientContext()`
- **0G Storage** — each invoice archived permanently via `archive()`, root hash returned as proof
- **0G Chain** — invoice registered and paid on-chain via an escrow smart contract

Source: [github.com/anbusan19/0g-memory](https://github.com/anbusan19/0g-memory)

---

## License

MIT
