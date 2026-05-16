import { Indexer, MemData, Batcher, FixedPriceFlow__factory, KvClient } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

const FLOW_CONTRACT_TESTNET = '0x22E03a6A89B950F1c82ec5e74F8eCa321a105296';
const FLOW_CONTRACT_MAINNET = '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526';

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

  // KV write — fast, overwritable. Used for agent context and the key→rootHash index.
  async kvWrite(streamId: string, key: string, value: string): Promise<string> {
    const [nodes, err] = await this.indexer.selectNodes(1);
    if (err) throw new Error(`Node selection failed: ${err}`);

    const flow = FixedPriceFlow__factory.connect(this.flowAddress, this.signer);
    const batcher = new Batcher(1, nodes, flow, this.rpcUrl);

    const streamIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(streamId));
    const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
    const valueBytes = Uint8Array.from(Buffer.from(value, 'utf-8'));
    batcher.streamDataBuilder.set(streamIdBytes32, keyBytes, valueBytes);

    const [tx, batchErr] = await batcher.exec();
    if (batchErr) throw new Error(`KV write failed: ${batchErr}`);

    return tx.txHash;
  }

  // KV read — look up a value by key from a KV stream on a storage node.
  async kvRead(streamId: string, key: string): Promise<string | null> {
    const [nodes, err] = await this.indexer.selectNodes(1);
    if (err || nodes.length === 0) return null;

    // StorageNode extends HttpProvider which stores .url on the instance
    const nodeUrl = (nodes[0] as unknown as { url: string }).url;
    const kvClient = new KvClient(nodeUrl);

    const streamIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(streamId));
    const keyHex = ethers.hexlify(Buffer.from(key, 'utf-8'));

    try {
      const value = await kvClient.getValue(streamIdBytes32, keyHex);
      if (!value) return null;
      return Buffer.from(value.data, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  // Log write — permanent, immutable. Returns the content-address root hash.
  async logWrite(data: object): Promise<string> {
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const memData = new MemData(encoded);

    const [result, uploadErr] = await this.indexer.upload(memData, this.rpcUrl, this.signer);
    if (uploadErr) throw new Error(`Log write failed: ${uploadErr}`);

    return (result as { rootHash: string }).rootHash;
  }

  // Retrieve a Log record into memory — works in both Node.js and browsers.
  async retrieveToMemory(rootHash: string): Promise<unknown> {
    const [blob, err] = await this.indexer.downloadToBlob(rootHash);
    if (err) throw new Error(`Retrieve failed: ${err}`);
    return JSON.parse(await blob.text());
  }

  getStorageScanUrl(rootHash: string): string {
    return `https://storagescan-galileo.0g.ai/tx/${rootHash}`;
  }
}
