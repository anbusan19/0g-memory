import { ChainMemory } from 'chainmemory-sdk';

let memoryInstance: ChainMemory | null = null;

export function getMemory(): ChainMemory {
  if (!memoryInstance) {
    memoryInstance = new ChainMemory({
      agentId: 'agentbill-v1',
      privateKey: process.env.PRIVATE_KEY!,
      rpcUrl: process.env.NEXT_PUBLIC_OG_RPC_URL || 'https://evmrpc.0g.ai',
      indexerRpc: process.env.OG_INDEXER_RPC || 'https://indexer-storage-mainnet-turbo.0g.ai',
    });
  }
  return memoryInstance;
}

export interface ClientContext {
  clientName: string;
  totalInvoiced: number;
  invoiceCount: number;
  lastJobDescription: string;
  lastInvoiceId: string;
  lastSeen: string;
}

export async function getClientContext(clientName: string): Promise<ClientContext | null> {
  const memory = getMemory();
  const key = `client:${clientName.toLowerCase().replace(/\s/g, '_')}`;
  return memory.recall(key) as Promise<ClientContext | null>;
}

export async function updateClientContext(
  clientName: string,
  invoice: { invoiceId: string; total: number; items: unknown[] },
  jobDescription: string
): Promise<void> {
  const memory = getMemory();
  const existing = await getClientContext(clientName);

  const updated: ClientContext = {
    clientName,
    totalInvoiced: (existing?.totalInvoiced ?? 0) + invoice.total,
    invoiceCount: (existing?.invoiceCount ?? 0) + 1,
    lastJobDescription: jobDescription,
    lastInvoiceId: invoice.invoiceId,
    lastSeen: new Date().toISOString(),
  };

  await memory.updateClientContext(clientName, updated);
}

export async function archiveInvoice(invoice: object): Promise<{
  rootHash: string;
  storageScanUrl: string;
}> {
  const memory = getMemory();
  return memory.archive({ type: 'invoice', data: invoice });
}
