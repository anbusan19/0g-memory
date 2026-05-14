import { NextRequest, NextResponse } from 'next/server';
import { getClientContext } from '../../../../agent/memory';

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientName: string } }
) {
  const context = await getClientContext(decodeURIComponent(params.clientName));
  if (!context) {
    return NextResponse.json({ found: false, context: null });
  }
  return NextResponse.json({ found: true, context });
}
