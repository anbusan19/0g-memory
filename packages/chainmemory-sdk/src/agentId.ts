import { ethers } from 'ethers';

export interface AgentIdentity {
  agentId: string;
  walletAddress: string;
  registeredAt: string;
}

// Derive a deterministic agent ID from a wallet address and a human-readable name.
// Format: <name>:<checksummed-address-prefix>
export function deriveAgentId(name: string, privateKey: string): AgentIdentity {
  const wallet = new ethers.Wallet(privateKey);
  const addressPrefix = wallet.address.slice(2, 10).toLowerCase();
  const agentId = `${name}:${addressPrefix}`;

  return {
    agentId,
    walletAddress: wallet.address,
    registeredAt: new Date().toISOString(),
  };
}

// Validate that an agentId string matches the expected format
export function isValidAgentId(agentId: string): boolean {
  return /^[a-z0-9-]+:[a-f0-9]{8}$/.test(agentId);
}
