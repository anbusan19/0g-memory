import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const client = new OpenAI({
  baseURL: process.env.OG_COMPUTE_BASE_URL || 'https://router-api.0g.ai/v1',
  apiKey: process.env.OG_COMPUTE_API_KEY!,
});

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  invoiceId: string;
  clientName: string;
  agentWallet: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: string;
  generatedAt: string;
  notes: string;
}

export async function generateInvoice(
  clientName: string,
  jobDescription: string,
  agentWallet: string,
  clientHistory?: object
): Promise<Invoice> {
  const historyContext = clientHistory
    ? `Previous work context for this client: ${JSON.stringify(clientHistory)}`
    : 'New client — no previous history.';

  const prompt = `You are an autonomous invoice generation agent.

Client: ${clientName}
Job Description: ${jobDescription}
${historyContext}

Generate a detailed, professional invoice. Output ONLY valid JSON matching this exact schema:
{
  "items": [{ "description": string, "quantity": number, "rate": number, "amount": number }],
  "subtotal": number,
  "tax": number,
  "total": number,
  "currency": "USD",
  "dueDate": "YYYY-MM-DD (30 days from today)",
  "notes": string
}

Be realistic with rates. Tax = 10% of subtotal. No markdown, no explanation — JSON only.`;

  const completion = await client.chat.completions.create({
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content!.trim();
  const clean = raw.replace(/```json|```/g, '').trim();
  const generated = JSON.parse(clean);

  return {
    invoiceId: `INV-${uuidv4().slice(0, 8).toUpperCase()}`,
    clientName,
    agentWallet,
    generatedAt: new Date().toISOString(),
    ...generated,
  };
}
