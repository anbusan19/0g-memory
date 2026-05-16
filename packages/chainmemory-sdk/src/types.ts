export interface ChainMemoryConfig {
  /** Unique identifier for this agent (use deriveAgentId() to create one). */
  agentId: string;
  /** Private key of the wallet that pays for 0G storage transactions. */
  privateKey: string;
  /** 0G chain JSON-RPC endpoint (e.g. https://evmrpc-testnet.0g.ai). */
  rpcUrl: string;
  /** 0G storage indexer endpoint (e.g. https://indexer-storage-testnet-standard.0g.ai). */
  indexerRpc: string;
}

export interface MemoryEntry {
  agentId: string;
  key: string;
  value: unknown;
  timestamp: number;
}

export interface ArchiveRecord {
  agentId: string;
  type: 'invoice' | 'payment' | 'interaction' | 'custom';
  data: unknown;
  timestamp: number;
  rootHash?: string;
}
