import { NextRequest, NextResponse } from 'next/server';
import { generateIcebreaker, interpretResponseAndDecideNextAction } from '@/integrations/openai/classifier';
import { getBusinessConfig } from '@/lib/business-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = getBusinessConfig();

    if (body.action === 'icebreaker') {
      const { instagramHandle, fullName, bio, followerCount, funnelType, samplePostContext, targetService } = body;
      const result = await generateIcebreaker({
        instagramHandle: instagramHandle || '@perfil_exemplo',
        fullName,
        bio,
        followerCount: Number(followerCount) || 5000,
        funnelType: funnelType || 'customer',
        samplePostContext,
        targetService
      }, config);

      return NextResponse.json({ success: true, result });
    } else if (body.action === 'reply_decision') {
      const { leadProfile, lastLeadMessage, history } = body;
      const result = await interpretResponseAndDecideNextAction(
        leadProfile || { instagramHandle: '@lead_teste' },
        lastLeadMessage || 'Olá, como funciona?',
        history || [],
        config
      );

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, error: 'Ação de simulação desconhecida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in AI simulation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
