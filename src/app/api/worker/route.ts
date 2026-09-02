import { NextRequest, NextResponse } from 'next/server';
import { getBusinessConfig, saveBusinessConfig } from '@/lib/business-config';
import { db } from '@/db';
import { generateIcebreaker } from '@/integrations/gemini/classifier';
import { sendInstagramDmOverCdp, checkChromeCdpStatus } from '@/integrations/browser/playwright';

export async function GET() {
  try {
    const chromeStatus = await checkChromeCdpStatus();
    return NextResponse.json({ success: true, chromeStatus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = getBusinessConfig();

    if (body.action === 'toggle_pause') {
      const newStatus = !config.SYSTEM_PAUSED;
      const updated = saveBusinessConfig({ SYSTEM_PAUSED: newStatus });
      return NextResponse.json({ success: true, paused: updated.SYSTEM_PAUSED });
    }

    if (body.action === 'check_chrome') {
      const status = await checkChromeCdpStatus();
      return NextResponse.json({ success: true, status });
    }

    if (body.action === 'send_direct_dm') {
      const { leadId, messageText, dryRun } = body;
      const targetLead = db.leads.getById(leadId);
      if (!targetLead) {
        return NextResponse.json({ success: false, error: 'Lead não encontrado.' }, { status: 404 });
      }

      const textToSend = messageText || (
        await generateIcebreaker({
          instagramHandle: targetLead.instagramHandle,
          fullName: targetLead.fullName || undefined,
          bio: targetLead.bio || undefined,
          followerCount: targetLead.followerCount || undefined,
          funnelType: targetLead.funnelType || undefined,
        }, config)
      ).message;

      // Send over real Chrome CDP
      const browserResult = await sendInstagramDmOverCdp(targetLead.instagramHandle, textToSend, { dryRun: !!dryRun });

      if (browserResult.success) {
        const now = new Date().toISOString();
        const msgId = 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

        // Record message in database
        db.messages.insert({
          id: msgId,
          leadId: targetLead.id,
          sender: 'agent',
          channel: 'browser',
          content: textToSend,
          variant: 'Real_CDP_Chrome',
          claimsUsed: JSON.stringify(config.VERIFIED_CLAIMS.slice(0, 2)),
          intentDetected: null,
          sentAt: now,
          createdAt: now,
        });

        // Update lead status
        db.leads.update(targetLead.id, {
          pipelineStatus: 'contacted',
          channelState: 'waiting_inbound_reply',
          lastContactAt: now,
        });
      }

      return NextResponse.json({
        success: browserResult.success,
        message: browserResult.message,
        browserResult,
        sentText: textToSend
      });
    }

    if (body.action === 'run_cycle') {
      if (config.SYSTEM_PAUSED) {
        return NextResponse.json({ success: false, message: 'O sistema está pausado pelo operador. Despause para executar o ciclo.' });
      }

      // Find pending leads for first DM
      const allLeads = db.leads.getAll();
      const pendingLeads = allLeads.filter(l => l.pipelineStatus === 'discovered' && l.channelState === 'browser_contact_pending');

      if (pendingLeads.length === 0) {
        return NextResponse.json({ success: true, message: 'Nenhum lead pendente de primeira abordagem no momento.' });
      }

      const targetLead = pendingLeads[0];
      const icebreaker = await generateIcebreaker({
        instagramHandle: targetLead.instagramHandle,
        fullName: targetLead.fullName || undefined,
        bio: targetLead.bio || undefined,
        followerCount: targetLead.followerCount || undefined,
        funnelType: targetLead.funnelType || undefined,
      }, config);

      // Attempt to send over Chrome CDP if available
      const browserResult = await sendInstagramDmOverCdp(targetLead.instagramHandle, icebreaker.message, { dryRun: false });

      const now = new Date().toISOString();
      const msgId = 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

      db.messages.insert({
        id: msgId,
        leadId: targetLead.id,
        sender: 'agent',
        channel: 'browser',
        content: icebreaker.message,
        variant: icebreaker.variant,
        claimsUsed: JSON.stringify(icebreaker.claimsUsed),
        intentDetected: null,
        sentAt: now,
        createdAt: now,
      });

      db.leads.update(targetLead.id, {
        pipelineStatus: 'contacted',
        channelState: 'waiting_inbound_reply',
        lastContactAt: now,
      });

      return NextResponse.json({
        success: true,
        message: browserResult.isRealBrowser
          ? `[Chrome Real] ${browserResult.message}`
          : `[Simulação Local] Primeira DM gerada pelo Gemini e enfileirada para ${targetLead.instagramHandle}!`,
        lead: targetLead,
        generatedMessage: icebreaker.message,
        browserResult
      });
    }

    return NextResponse.json({ success: false, error: 'Ação de worker inválida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in worker route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
