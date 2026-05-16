import { StorageLayer } from './storage';
import { ChainMemoryConfig, MemoryEntry, ArchiveRecord } from './types';

// The KV stream used to store the key→rootHash index for each agent.
// Namespaced per agentId so agents never collide.
function indexStreamId(agentId: string): string {
  return `0gmemory:idx:${agentId}`;
}

export class ZeroGMemory {
  private storage: StorageLayer;
  private agentId: string;

  constructor(config: ChainMemoryConfig) {
    this.agentId = config.agentId;
    this.storage = new StorageLayer(
      config.privateKey,
      config.rpcUrl,
      config.indexerRpc,
    );
  }

  /**
   * remember() — writes `value` to the 0G Log layer (permanent, verifiable).
   * Concurrently writes a `key → rootHash` pointer to the 0G KV layer so
   * future `recall(key)` calls can locate the data from any machine.
   * Returns the content-address root hash (keep it if you need instant recall).
   */
  async remember(key: string, value: unknown): Promise<string> {
    const entry: MemoryEntry = {
      agentId: this.agentId,
      key,
      value,
      timestamp: Date.now(),
    };

    const rootHash = await this.storage.logWrite(entry);

    // KV index: fire-and-forget — stores key→rootHash so recall() works from
    // any machine without a local filesystem. Settles within a few blocks.
    this.storage
      .kvWrite(indexStreamId(this.agentId), key, rootHash)
      .catch(e =>
        console.warn('[0G-Memory] Index KV write non-fatal:', e?.shortMessage ?? e?.message ?? e),
      );

    return rootHash;
  }

  /**
   * recall() — resolves `key` to its root hash via the 0G KV index, then
   * fetches the value from the 0G Log layer.
   * Falls back to the legacy local-file index (.chainmemory/) for data written
   * before the KV index was introduced, and migrates those entries to KV on
   * first access. Returns null if the key has never been written.
   */
  async recall(key: string): Promise<unknown | null> {
    let rootHash = await this.storage.kvRead(indexStreamId(this.agentId), key);

    // Fallback: local filesystem index written by older SDK versions.
    if (!rootHash) {
      rootHash = await this.readLegacyLocalHash(key);
      if (rootHash) {
        // Migrate to KV so future recalls go through the distributed index.
        this.storage
          .kvWrite(indexStreamId(this.agentId), key, rootHash)
          .catch(() => {});
      }
    }

    if (!rootHash) return null;

    const record = (await this.storage.retrieveToMemory(rootHash)) as { value: unknown };
    return record.value ?? null;
  }

  private async readLegacyLocalHash(key: string): Promise<string | null> {
    try {
      const fs = await import('fs/promises');
      const raw = await fs.readFile(`.chainmemory/${this.agentId}/index.json`, 'utf-8');
      const index = JSON.parse(raw) as Record<string, string>;
      return index[key] ?? null;
    } catch {
      return null; // browser env, file missing, or parse error — all non-fatal
    }
  }

  /**
   * recallByHash() — retrieve a value directly by its root hash.
   * Useful right after remember() before the KV index has settled.
   */
  async recallByHash(rootHash: string): Promise<unknown | null> {
    const record = (await this.storage.retrieveToMemory(rootHash)) as { value: unknown };
    return record.value ?? null;
  }

  /**
   * archive() — writes an arbitrary record to the 0G Log layer permanently.
   * Suited for invoices, audit trails, and any immutable business records.
   * Returns the root hash and a StorageScan explorer URL.
   */
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

  /**
   * updateClientContext() — convenience wrapper that writes structured client
   * context under the key `client:<normalized-name>`.
   */
  async updateClientContext(clientName: string, context: object): Promise<string> {
    const key = `client:${clientName.toLowerCase().replace(/\s+/g, '_')}`;
    return this.remember(key, { ...context, lastSeen: new Date().toISOString() });
  }
}

// Keep the old class name as an alias for backward compatibility
export { ZeroGMemory as ChainMemory };

export type { ChainMemoryConfig, MemoryEntry, ArchiveRecord } from './types';
export { deriveAgentId, isValidAgentId } from './agentId';
