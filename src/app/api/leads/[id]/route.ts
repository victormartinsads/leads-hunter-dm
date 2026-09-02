import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = db.leads.getById(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead não encontrado.' }, { status: 404 });
    }

    const leadMessages = db.messages.getByLeadId(id);

    return NextResponse.json({ success: true, lead, messages: leadMessages });
  } catch (error: any) {
    console.error('Error fetching lead detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = db.leads.getById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lead não encontrado.' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.followerCount !== undefined) updateData.followerCount = Number(body.followerCount);
    if (body.icpScore !== undefined) updateData.icpScore = Number(body.icpScore);
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.pipelineStatus !== undefined) updateData.pipelineStatus = body.pipelineStatus;
    if (body.channelState !== undefined) updateData.channelState = body.channelState;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.whatsappPhone !== undefined) updateData.whatsappPhone = body.whatsappPhone;
    if (body.nextActionAt !== undefined) updateData.nextActionAt = body.nextActionAt;

    const updatedLead = db.leads.update(id, updateData);

    // If message is being added simultaneously
    if (body.newMessage) {
      const now = new Date().toISOString();
      const msg = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        leadId: id,
        sender: body.newMessage.sender || 'agent',
        channel: body.newMessage.channel || 'browser',
        content: body.newMessage.content,
        variant: body.newMessage.variant || null,
        claimsUsed: JSON.stringify(body.newMessage.claimsUsed || []),
        intentDetected: body.newMessage.intentDetected || null,
        sentAt: now,
        createdAt: now,
      };
      db.messages.insert(msg);
      db.leads.update(id, { lastContactAt: now });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    db.leads.delete(id);
    return NextResponse.json({ success: true, message: 'Lead removido com sucesso.' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
