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

  // remember() — writes to KV layer. Fast. Use for client context.
  async remember(key: string, value: unknown): Promise<string> {
    const streamId = `chainmemory:agent:${this.agentId}`;
    const serialized = JSON.stringify(value);
    return this.storage.kvWrite(streamId, key, serialized);
  }

  // recall() — reads from local cache. 0G Storage Log is the verifiable permanent record.
  async recall(key: string): Promise<unknown | null> {
    const cacheFile = `.chainmemory/${this.agentId}/${key}.json`;
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(cacheFile, 'utf-8');
      return JSON.parse(data);
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

  // Convenience: store client context after every interaction (KV + local cache)
  async updateClientContext(clientName: string, context: object): Promise<void> {
    const key = `client:${clientName.toLowerCase().replace(/\s/g, '_')}`;
    await this.remember(key, {
      ...context,
      lastSeen: new Date().toISOString(),
    });

    const fs = await import('fs/promises');
    const dir = `.chainmemory/${this.agentId}`;
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${key}.json`, JSON.stringify(context));
  }
}

export type { ChainMemoryConfig, MemoryEntry, ArchiveRecord } from './types';
export { deriveAgentId, isValidAgentId } from './agentId';
