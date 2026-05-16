import { StorageLayer } from './storage';
import { ChainMemoryConfig, MemoryEntry, ArchiveRecord } from './types';

export class ChainMemory {
  private storage: StorageLayer;
  private agentId: string;

  constructor(config: ChainMemoryConfig) {
    this.agentId = config.agentId;
    this.storage = new StorageLayer(
      config.privateKey,
      config.rpcUrl,
      config.indexerRpc
    );
  }

  // remember() — Log write (verifiable, primary) + KV write (on-chain stream, bonus). Returns root hash.
  async remember(key: string, value: unknown): Promise<string> {
    // Log write first — this is the verifiable permanent record and is proven to work
    const rootHash = await this.storage.logWrite({
      agentId: this.agentId,
      key,
      value,
      timestamp: Date.now(),
    });

    // Store only the key→rootHash pointer locally (not the data itself)
    await this.saveRootHashIndex(key, rootHash);

    // KV write — best-effort on-chain stream write (non-fatal)
    const streamId = `chainmemory:agent:${this.agentId}`;
    this.storage.kvWrite(streamId, key, JSON.stringify(value)).catch((e) =>
      console.warn('[ChainMemory] KV write failed (non-fatal):', e.shortMessage ?? e.message)
    );

    return rootHash;
  }

  // recall() — looks up the root hash index, then retrieves data FROM 0G Storage
  async recall(key: string): Promise<unknown | null> {
    const rootHash = await this.getRootHashIndex(key);
    if (!rootHash) return null;

    const record = await this.storage.retrieveToMemory(rootHash) as { value: unknown };
    return record.value ?? null;
  }

  private async saveRootHashIndex(key: string, rootHash: string): Promise<void> {
    const fs = await import('fs/promises');
    const dir = `.chainmemory/${this.agentId}`;
    const indexPath = `${dir}/index.json`;
    await fs.mkdir(dir, { recursive: true });
    let index: Record<string, string> = {};
    try { index = JSON.parse(await fs.readFile(indexPath, 'utf-8')); } catch {}
    index[key] = rootHash;
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  private async getRootHashIndex(key: string): Promise<string | null> {
    const fs = await import('fs/promises');
    try {
      const index = JSON.parse(
        await fs.readFile(`.chainmemory/${this.agentId}/index.json`, 'utf-8')
      );
      return index[key] ?? null;
    } catch {
      return null;
    }
  }

  // archive() — writes to Log layer. Permanent. Returns StorageScan URL.
  async archive(record: Omit<ArchiveRecord, 'agentId' | 'timestamp'>): Promise<{
    rootHash: string;
    storageScanUrl: string;
  }> {
    const fullRecord: ArchiveRecord = {
      agentId: this.agentId,
      timestamp: Date.now(),
      ...record,
    };

    const rootHash = await this.storage.logWrite(fullRecord);

    return {
      rootHash,
      storageScanUrl: this.storage.getStorageScanUrl(rootHash),
    };
  }

  // Convenience: store client context — data written to 0G Storage, only root hash index stored locally
  async updateClientContext(clientName: string, context: object): Promise<void> {
    const key = `client:${clientName.toLowerCase().replace(/\s/g, '_')}`;
    await this.remember(key, { ...context, lastSeen: new Date().toISOString() });
  }
}

export type { ChainMemoryConfig, MemoryEntry, ArchiveRecord } from './types';
export { deriveAgentId, isValidAgentId } from './agentId';
