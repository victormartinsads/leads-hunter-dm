import { db } from '@/db';
import { checkBudgetExceeded } from '@/lib/budget-guard';
import { getBusinessConfig } from '@/lib/business-config';
import { sendInstagramDmOverCdp } from '@/integrations/browser/playwright';

export async function runPendingJobs(): Promise<{ processed: number; errors: number }> {
  const config = getBusinessConfig();

  if (config.SYSTEM_PAUSED) {
    console.log('[Worker] Sistema em estado de PAUSA DE EMERGÊNCIA. Nenhuma job será processada.');
    return { processed: 0, errors: 0 };
  }

  const budget = await checkBudgetExceeded();
  if (budget.exceeded) {
    console.warn(`[Worker] Orçamento mensal de IA excedido ($${budget.currentSpentUsd.toFixed(2)} USD). Jobs pausadas.`);
    return { processed: 0, errors: 0 };
  }

  // Get pending jobs
  const sqlite = db.getSqlite();
  const pendingJobs = sqlite.prepare("SELECT * FROM jobs WHERE status = 'pending' ORDER BY createdAt ASC LIMIT 5").all() as any[];

  let processedCount = 0;
  let errorCount = 0;

  for (const job of pendingJobs) {
    try {
      sqlite.prepare("UPDATE jobs SET status = 'running', lockedAt = ? WHERE id = ?").run(new Date().toISOString(), job.id);

      const payload = JSON.parse(job.payload);

      if (job.type === 'browser_dm') {
        const lead = db.leads.getById(payload.leadId);
        if (lead && lead.channelState === 'browser_contact_pending') {
          const dmResult = await sendInstagramDmOverCdp(lead.instagramHandle, payload.messageText, { dryRun: payload.dryRun });

          if (dmResult.success) {
            db.leads.update(lead.id, {
              channelState: 'browser_contact_sent',
              pipelineStatus: 'contacted',
              lastContactAt: new Date().toISOString()
            });

            db.messages.insert({
              id: 'msg_' + Math.random().toString(36).substring(2, 10),
              leadId: lead.id,
              sender: 'agent',
              channel: 'browser',
              content: payload.messageText,
              createdAt: new Date().toISOString()
            });

            sqlite.prepare("UPDATE jobs SET status = 'completed', updatedAt = ? WHERE id = ?").run(new Date().toISOString(), job.id);
            processedCount++;
          } else {
            sqlite.prepare("UPDATE jobs SET status = 'failed', errorDetails = ?, updatedAt = ? WHERE id = ?").run(dmResult.message || 'Falha ao enviar DM', new Date().toISOString(), job.id);
            errorCount++;
          }
        }
      } else {
        sqlite.prepare("UPDATE jobs SET status = 'completed', updatedAt = ? WHERE id = ?").run(new Date().toISOString(), job.id);
        processedCount++;
      }
    } catch (err: any) {
      console.error(`[Worker] Erro ao processar job ${job.id}:`, err);
      sqlite.prepare("UPDATE jobs SET status = 'failed', errorDetails = ?, updatedAt = ? WHERE id = ?").run(err.message, new Date().toISOString(), job.id);
      errorCount++;
    }
  }

  return { processed: processedCount, errors: errorCount };
}
