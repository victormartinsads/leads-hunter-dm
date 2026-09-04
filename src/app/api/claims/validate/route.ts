import { NextRequest, NextResponse } from 'next/server';
import { auditClaimCompliance } from '@/integrations/openai/classifier';
import { getBusinessConfig } from '@/lib/business-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, error: 'Texto para validação é obrigatório.' }, { status: 400 });
    }

    const config = getBusinessConfig();
    const result = await auditClaimCompliance(text, config);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error validating claims:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
