import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const funnelType = searchParams.get('funnel');
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    let allLeads = db.leads.getAll();

    if (funnelType) {
      allLeads = allLeads.filter(l => l.funnelType === funnelType);
    }
    if (status) {
      allLeads = allLeads.filter(l => l.pipelineStatus === status);
    }
    if (search) {
      const term = search.toLowerCase();
      allLeads = allLeads.filter(l => 
        l.instagramHandle.toLowerCase().includes(term) ||
        (l.fullName && l.fullName.toLowerCase().includes(term)) ||
        (l.notes && l.notes.toLowerCase().includes(term))
      );
    }

    return NextResponse.json({ success: true, leads: allLeads });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let handle = body.instagramHandle?.trim();
    if (!handle) {
      return NextResponse.json({ success: false, error: 'O @ do Instagram é obrigatório.' }, { status: 400 });
    }
    if (!handle.startsWith('@')) {
      handle = '@' + handle;
    }

    // Check duplicate
    const existing = db.leads.getByHandle(handle);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Este perfil do Instagram já está cadastrado no sistema.', lead: existing }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newLead = {
      id: 'lead_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      instagramHandle: handle,
      fullName: body.fullName || null,
      bio: body.bio || null,
      followerCount: Number(body.followerCount) || 0,
      isBusiness: body.isBusiness ?? true,
      icpScore: Number(body.icpScore) || 75,
      priority: body.priority || 'medium',
      funnelType: body.funnelType || 'customer',
      pipelineStatus: body.pipelineStatus || 'discovered',
      channelState: body.channelState || 'browser_contact_pending',
      notes: body.notes || null,
      tags: JSON.stringify(body.tags || []),
      lastContactAt: null,
      nextActionAt: new Date(Date.now() + 3600000 * 2).toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    db.leads.insert(newLead);

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    db.leads.deleteAll();
    return NextResponse.json({ success: true, message: 'Todos os leads foram limpos do banco de dados.' });
  } catch (error: any) {
    console.error('Error deleting all leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
