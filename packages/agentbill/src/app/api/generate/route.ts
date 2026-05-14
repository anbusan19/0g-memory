import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { generateInvoice } from '../../../agent/invoice';
import { getClientContext, updateClientContext, archiveInvoice } from '../../../agent/memory';
import { registerInvoiceOnChain } from '../../../agent/payment';

export async function POST(req: NextRequest) {
  try {
    const { clientName, jobDescription } = await req.json();

    if (!clientName || !jobDescription) {
      return NextResponse.json(
        { error: 'clientName and jobDescription required' },
        { status: 400 }
      );
    }

    const agentWallet = new ethers.Wallet(process.env.PRIVATE_KEY!).address;

    // 1. Recall client history from ChainMemory (0G Storage KV)
    const clientHistory = await getClientContext(clientName);

    // 2. Generate invoice via 0G Compute (Llama 3.3 70B)
    const invoice = await generateInvoice(
      clientName,
      jobDescription,
      agentWallet,
      clientHistory ?? undefined
    );

    // 3. Archive invoice to 0G Storage Log (permanent, immutable)
    const { rootHash, storageScanUrl } = await archiveInvoice(invoice);

    // 4. Register invoice on 0G Chain with storage root hash as proof
    const { txHash, chainScanUrl } = await registerInvoiceOnChain(
      invoice.invoiceId,
      agentWallet,
      rootHash
    );

    // 5. Update client context in ChainMemory KV layer
    await updateClientContext(clientName, invoice, jobDescription);

    return NextResponse.json({
      success: true,
      invoice,
      proofs: {
        storageRootHash: rootHash,
        storageScanUrl,
        chainTxHash: txHash,
        chainScanUrl,
      },
      isReturningClient: !!clientHistory,
      clientHistory,
    });
  } catch (err) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
