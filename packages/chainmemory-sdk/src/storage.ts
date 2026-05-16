import { Indexer, MemData, Batcher, FixedPriceFlow__factory } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

// 0G mainnet flow contract — used by Batcher for KV writes
const FLOW_CONTRACT_MAINNET = '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526';
const FLOW_CONTRACT_TESTNET = '0x22E03a6A89B950F1c82ec5e74F8eCa321a105296';

function getFlowAddress(rpcUrl: string): string {
  return rpcUrl.includes('testnet') ? FLOW_CONTRACT_TESTNET : FLOW_CONTRACT_MAINNET;
}

export class StorageLayer {
  private indexer: Indexer;
  private signer: ethers.Wallet;
  private rpcUrl: string;
  private flowAddress: string;

  constructor(privateKey: string, rpcUrl: string, indexerRpc: string) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, provider);
    this.indexer = new Indexer(indexerRpc);
    this.rpcUrl = rpcUrl;
    this.flowAddress = getFlowAddress(rpcUrl);
  }

  // KV write — fast, overwritable. Use for agent context and client data.
  async kvWrite(streamId: string, key: string, value: string): Promise<string> {
    const [nodes, err] = await this.indexer.selectNodes(1);
    if (err) throw new Error(`Node selection failed: ${err}`);

    const flow = FixedPriceFlow__factory.connect(this.flowAddress, this.signer);
    const batcher = new Batcher(1, nodes, flow, this.rpcUrl);

    // streamId must be bytes32 — hash the human-readable string
    const streamIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(streamId));
    const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
    const valueBytes = Uint8Array.from(Buffer.from(value, 'utf-8'));
    batcher.streamDataBuilder.set(streamIdBytes32, keyBytes, valueBytes);

    const [tx, batchErr] = await batcher.exec();
    if (batchErr) throw new Error(`KV write failed: ${batchErr}`);

    return tx.txHash;
  }

  // Log write — permanent, immutable. Use for invoices and audit trail.
  async logWrite(data: object): Promise<string> {
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const memData = new MemData(encoded);

    const [result, uploadErr] = await this.indexer.upload(memData, this.rpcUrl, this.signer);
    if (uploadErr) throw new Error(`Log write failed: ${uploadErr}`);

    // upload returns single-file result with rootHash
    const rootHash = (result as { rootHash: string }).rootHash;
    return rootHash;
  }

  // Download by root hash — use to retrieve archived records
  async retrieve(rootHash: string, outputPath: string): Promise<void> {
    const err = await this.indexer.download(rootHash, outputPath, true);
    if (err) throw new Error(`Retrieve failed: ${err}`);
  }

  // Retrieve a Log record directly into memory (no persistent local file)
  async retrieveToMemory(rootHash: string): Promise<unknown> {
    const os = await import('os');
    const path = await import('path');
    const fs = await import('fs/promises');

    const tmpFile = path.join(os.tmpdir(), `cm-${rootHash.slice(0, 16)}.json`);
    try {
      const err = await this.indexer.download(rootHash, tmpFile, true);
      if (err) throw new Error(`Retrieve failed: ${err}`);
      const raw = await fs.readFile(tmpFile, 'utf-8');
      return JSON.parse(raw);
    } finally {
      await fs.unlink(tmpFile).catch(() => {});
    }
  }

  getStorageScanUrl(rootHash: string): string {
    return `https://storagescan.0g.ai/tx/${rootHash}`;
  }
}
