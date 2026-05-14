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

export interface ChainMemoryConfig {
  agentId: string;
  privateKey: string;
  rpcUrl: string;
  indexerRpc: string;
}
