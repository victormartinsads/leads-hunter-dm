import { NextRequest, NextResponse } from 'next/server';
import { getBusinessConfig, saveBusinessConfig } from '@/lib/business-config';

export async function GET() {
  try {
    const config = getBusinessConfig();
    return NextResponse.json({
      success: true,
      verifiedClaims: config.VERIFIED_CLAIMS || [],
      unverifiedClaims: config.UNVERIFIED_CLAIMS || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = getBusinessConfig();

    let verified = [...config.VERIFIED_CLAIMS];
    let unverified = [...config.UNVERIFIED_CLAIMS];

    if (body.action === 'add') {
      const { text, type } = body;
      if (!text || text.trim() === '') {
        return NextResponse.json({ success: false, error: 'O texto da afirmação é obrigatório.' }, { status: 400 });
      }

      if (type === 'verified') {
        if (!verified.includes(text.trim())) {
          verified.push(text.trim());
        }
      } else {
        if (!unverified.includes(text.trim())) {
          unverified.push(text.trim());
        }
      }
    } else if (body.action === 'promote') {
      // Promote from unverified to verified (Proof attached/provided)
      const { index, proofNote } = body;
      if (index >= 0 && index < unverified.length) {
        const item = unverified[index];
        unverified.splice(index, 1);
        const promotedText = proofNote ? `${item} (Comprovado: ${proofNote})` : item;
        verified.push(promotedText);
      }
    } else if (body.action === 'demote') {
      // Move from verified to unverified
      const { index } = body;
      if (index >= 0 && index < verified.length) {
        const item = verified[index];
        verified.splice(index, 1);
        unverified.push(item);
      }
    } else if (body.action === 'delete') {
      const { index, type } = body;
      if (type === 'verified') {
        verified.splice(index, 1);
      } else {
        unverified.splice(index, 1);
      }
    } else if (body.action === 'update_all') {
      if (Array.isArray(body.verifiedClaims)) verified = body.verifiedClaims;
      if (Array.isArray(body.unverifiedClaims)) unverified = body.unverifiedClaims;
    }

    const updated = saveBusinessConfig({
      VERIFIED_CLAIMS: verified,
      UNVERIFIED_CLAIMS: unverified,
    });

    return NextResponse.json({
      success: true,
      verifiedClaims: updated.VERIFIED_CLAIMS,
      unverifiedClaims: updated.UNVERIFIED_CLAIMS,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
