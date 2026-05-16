import { ethers } from 'ethers';

const ABI = [
  'function registerInvoice(string invoiceId, address agent, string storageRootHash) external',
  'function pay(string invoiceId) external payable',
  'function release(string invoiceId) external',
  'function getJob(string invoiceId) external view returns (tuple(address client, address agent, uint256 amount, string invoiceId, string storageRootHash, uint8 status, uint256 createdAt))',
  'event PaymentReceived(string indexed invoiceId, address indexed client, uint256 amount)',
  'event PaymentReleased(string indexed invoiceId, address indexed agent, uint256 amount)',
];

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS!;
  return new ethers.Contract(address, ABI, signerOrProvider);
}

export async function registerInvoiceOnChain(
  invoiceId: string,
  agentWallet: string,
  storageRootHash: string
): Promise<{ txHash: string; chainScanUrl: string }> {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_OG_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const contract = getContract(signer);

  const tx = await contract.registerInvoice(invoiceId, agentWallet, storageRootHash);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    chainScanUrl: `https://chainscan-galileo.0g.ai/tx/${receipt.hash}`,
  };
}
