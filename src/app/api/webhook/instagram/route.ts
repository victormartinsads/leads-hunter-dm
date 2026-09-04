import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { getBusinessConfig } from '@/lib/business-config';
import { interpretResponseAndDecideNextAction } from '@/integrations/openai/classifier';
import { sendInstagramMessageViaMetaApi } from '@/integrations/instagram/graph-api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const configToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'buscando_milhao_webhook_token';

  if (mode === 'subscribe' && token === configToken) {
    console.log('[Meta Webhook] Webhook do Instagram validado com sucesso!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = getBusinessConfig();

    if (body.object === 'instagram') {
      for (const entry of body.entry || []) {
        for (const messagingItem of entry.messaging || []) {
          const senderId = messagingItem.sender?.id;
          const messageText = messagingItem.message?.text;

          if (senderId && messageText) {
            console.log(`[Meta Webhook] Mensagem recebida de ${senderId}: "${messageText}"`);

            // Find lead by metaLeadId or handle in database
            const allLeads = db.leads.getAll();
            let lead = allLeads.find(l => l.metaMessageId === senderId);

            if (!lead) {
              lead = allLeads.find(l => l.channelState === 'waiting_inbound_reply' || l.channelState === 'browser_contact_sent');
            }

            if (lead) {
              // 1. Channel Handoff: Handover channel property to Meta API
              db.leads.update(lead.id, {
                channelState: 'api_active',
                pipelineStatus: 'replied',
                metaMessageId: senderId,
                lastContactAt: new Date().toISOString()
              });

              // 2. Save inbound message in database
              db.messages.insert({
                id: 'msg_in_' + Math.random().toString(36).substring(2, 10),
                leadId: lead.id,
                sender: 'lead',
                channel: 'api',
                content: messageText,
                metaMessageId: messagingItem.message?.mid,
                createdAt: new Date().toISOString()
              });

              // 3. Generate Step 2 AI response with OpenAI classifier
              const historyMsgs = db.messages.getByLeadId(lead.id);
              const historyFormatted = historyMsgs.map(m => ({
                sender: m.sender,
                content: m.content
              }));

              const aiDecision = await interpretResponseAndDecideNextAction(
                {
                  instagramHandle: lead.instagramHandle,
                  fullName: lead.fullName || undefined,
                  funnelType: lead.funnelType,
                  targetService: lead.targetService || undefined
                },
                messageText,
                historyFormatted,
                config
              );

              // Handle Opt-Out
              if (aiDecision.intent === 'opt_out') {
                db.leads.update(lead.id, {
                  channelState: 'do_not_contact',
                  pipelineStatus: 'closed',
                  notes: 'Lead solicitou encerramento (Opt-out).'
                });
              }

              // Send response via Meta Official API if reply is suggested
              if (aiDecision.suggestedReply && aiDecision.intent !== 'opt_out') {
                const apiSendResult = await sendInstagramMessageViaMetaApi(senderId, aiDecision.suggestedReply);

                if (apiSendResult.success) {
                  db.messages.insert({
                    id: 'msg_out_' + Math.random().toString(36).substring(2, 10),
                    leadId: lead.id,
                    sender: 'agent',
                    channel: 'api',
                    content: aiDecision.suggestedReply,
                    metaMessageId: apiSendResult.messageId,
                    createdAt: new Date().toISOString()
                  });

                  if (aiDecision.intent === 'wants_whatsapp') {
                    db.leads.update(lead.id, {
                      pipelineStatus: lead.funnelType === 'affiliate' ? 'joined_affiliate_group' : 'whatsapp_handoff',
                      channelState: 'completed'
                    });
                  }
                }
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true, message: 'EVENT_RECEIVED' });
    }

    return NextResponse.json({ success: false, message: 'Not an instagram event' }, { status: 404 });
  } catch (error: any) {
    console.error('Error handling Meta Instagram Webhook:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
