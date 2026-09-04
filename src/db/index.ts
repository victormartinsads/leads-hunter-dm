import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { Lead, Message, AiCall, Job } from './schema';

// Ensure data directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'buscandomilhao.sqlite');

declare global {
  var __dbInstance: DatabaseSync | undefined;
}

function getDatabase(): DatabaseSync {
  if (!global.__dbInstance) {
    global.__dbInstance = new DatabaseSync(dbPath);
    initTables(global.__dbInstance);
  }
  return global.__dbInstance;
}

function initTables(sqlite: DatabaseSync) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      instagramHandle TEXT NOT NULL UNIQUE,
      fullName TEXT,
      bio TEXT,
      category TEXT,
      followerCount INTEGER DEFAULT 0,
      isBusiness INTEGER DEFAULT 1,
      funnelType TEXT NOT NULL DEFAULT 'customer',
      pipelineStatus TEXT NOT NULL DEFAULT 'discovered',
      channelState TEXT NOT NULL DEFAULT 'browser_contact_pending',
      icpSegment TEXT,
      icpScore INTEGER DEFAULT 50,
      targetService TEXT,
      location TEXT,
      externalUrl TEXT,
      whatsappNumber TEXT,
      notes TEXT,
      metaMessageId TEXT,
      lastContactAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      leadId TEXT NOT NULL,
      sender TEXT NOT NULL,
      channel TEXT NOT NULL,
      content TEXT NOT NULL,
      metaMessageId TEXT,
      variantId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(leadId) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS ai_calls (
      id TEXT PRIMARY KEY,
      leadId TEXT,
      model TEXT NOT NULL,
      promptTokens INTEGER DEFAULT 0,
      candidateTokens INTEGER DEFAULT 0,
      totalTokens INTEGER DEFAULT 0,
      estimatedCostUsd REAL DEFAULT 0.0,
      purpose TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payload TEXT NOT NULL,
      retries INTEGER DEFAULT 0,
      lockedAt TEXT,
      errorDetails TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      hypothesis TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS experiment_variants (
      id TEXT PRIMARY KEY,
      experimentId TEXT NOT NULL,
      name TEXT NOT NULL,
      promptTemplate TEXT NOT NULL,
      impressionsCount INTEGER DEFAULT 0,
      conversionsCount INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info',
      details TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  const countRow = sqlite.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
  if (countRow && countRow.count === 0) {
    seedInitialData(sqlite);
  }
}

function seedInitialData(sqlite: DatabaseSync) {
  const now = new Date().toISOString();
  const sampleLeads = [
    {
      id: 'lead_1',
      instagramHandle: '@dra.ericaodontologia',
      fullName: 'Dra. Erica Oliveira | Odontologia Estética',
      bio: 'Lentes de contato dental e Harmonização Facial | Agendamentos via Direct & WhatsApp',
      category: 'Clínica Odontológica',
      followerCount: 15400,
      isBusiness: 1,
      funnelType: 'customer',
      pipelineStatus: 'contacted',
      channelState: 'waiting_inbound_reply',
      icpSegment: 'Clinica odontologica',
      icpScore: 95,
      targetService: 'Chatbot de Atendimento Comercial 24/7',
      location: 'São Paulo - SP',
      notes: 'Clínica de odontologia estética com alto volume de interessados em lentes no Instagram.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: now,
    },
    {
      id: 'lead_2',
      instagramHandle: '@clinicamedica.orizon',
      fullName: 'Clínica Médica Orizon | Consultórios Integrados',
      bio: 'Centro médico de especialidades | Cardiologia, Dermatologia e Pediatria | Agende sua consulta',
      category: 'Clínica Médica',
      followerCount: 28900,
      isBusiness: 1,
      funnelType: 'customer',
      pipelineStatus: 'replied',
      channelState: 'api_eligible',
      icpSegment: 'Clinica Médica',
      icpScore: 92,
      targetService: 'Chatbot de Atendimento Comercial 24/7',
      location: 'Rio de Janeiro - RJ',
      notes: 'Respondeu à 1ª DM perguntando como funciona a automação do WhatsApp.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: now,
    },
    {
      id: 'lead_3',
      instagramHandle: '@studio.estetica.vittae',
      fullName: 'Vittae Estética Avançada',
      bio: 'Procedimentos estéticos faciais e corporais | Botox, preenchimento e depilação a laser',
      category: 'Clínica de Estética',
      followerCount: 9400,
      isBusiness: 1,
      funnelType: 'customer',
      pipelineStatus: 'whatsapp_handoff',
      channelState: 'completed',
      icpSegment: 'Clinica de estética',
      icpScore: 88,
      targetService: 'Gestão de Tráfego Pago (Meta & Google Ads)',
      location: 'Curitiba - PR',
      notes: 'Encaminhada com sucesso para o WhatsApp oficial da Mart Digital.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: now,
    },
    {
      id: 'lead_4',
      instagramHandle: '@carol.vendasdigitais',
      fullName: 'Carol Silveira',
      bio: 'Criadora de conteúdo | Dicas diárias de prospecção e vendas online para saúde e beleza 🚀',
      category: 'Criador de Conteúdo',
      followerCount: 45000,
      isBusiness: 0,
      funnelType: 'affiliate',
      pipelineStatus: 'interested',
      channelState: 'api_active',
      icpSegment: null,
      icpScore: 85,
      targetService: 'Programa de Afiliados Mart Digital',
      location: 'Belo Horizonte - MG',
      notes: 'Influenciadora com público de médicos e dentistas. Excelente fit para afiliados.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: now,
    }
  ];

  const insertLeadStmt = sqlite.prepare(`
    INSERT INTO leads (id, instagramHandle, fullName, bio, category, followerCount, isBusiness, funnelType, pipelineStatus, channelState, icpSegment, icpScore, targetService, location, notes, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of sampleLeads) {
    insertLeadStmt.run(
      l.id, l.instagramHandle, l.fullName, l.bio, l.category, l.followerCount, l.isBusiness,
      l.funnelType, l.pipelineStatus, l.channelState, l.icpSegment, l.icpScore,
      l.targetService, l.location, l.notes, l.createdAt, l.updatedAt
    );
  }

  const insertMsgStmt = sqlite.prepare(`
    INSERT INTO messages (id, leadId, sender, channel, content, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertMsgStmt.run('msg_1', 'lead_1', 'agent', 'browser', 'Opa, tudo bom? Posso tirar uma dúvida rápida com vocês?', new Date(Date.now() - 3600000 * 4).toISOString());
  insertMsgStmt.run('msg_2', 'lead_2', 'agent', 'browser', 'Opa, tudo bom? Posso tirar uma dúvida rápida com vocês?', new Date(Date.now() - 3600000 * 5).toISOString());
  insertMsgStmt.run('msg_3', 'lead_2', 'lead', 'api', 'Olá! Pode sim, em que posso ajudar?', new Date(Date.now() - 3600000 * 2).toISOString());

  const insertAiStmt = sqlite.prepare(`
    INSERT INTO ai_calls (id, leadId, model, promptTokens, candidateTokens, totalTokens, estimatedCostUsd, purpose, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAiStmt.run('call_1', 'lead_1', 'gpt-4o-mini', 420, 65, 485, 0.000068, 'icebreaker', new Date(Date.now() - 3600000 * 4).toISOString());
  insertAiStmt.run('call_2', 'lead_2', 'gpt-4o-mini', 380, 52, 432, 0.000060, 'icebreaker', new Date(Date.now() - 3600000 * 5).toISOString());
  insertAiStmt.run('call_3', 'lead_2', 'gpt-4o-mini', 510, 84, 594, 0.000085, 'classification', new Date(Date.now() - 3600000 * 2).toISOString());
}

export const db = {
  getSqlite: () => getDatabase(),

  leads: {
    getAll: () => getDatabase().prepare('SELECT * FROM leads ORDER BY updatedAt DESC').all() as unknown as Lead[],
    getById: (id: string) => getDatabase().prepare('SELECT * FROM leads WHERE id = ?').get(id) as unknown as Lead | undefined,
    getByHandle: (handle: string) => getDatabase().prepare('SELECT * FROM leads WHERE instagramHandle = ?').get(handle) as unknown as Lead | undefined,
    insert: (lead: Partial<Lead> & { id: string; instagramHandle: string; createdAt: string; updatedAt: string }) => {
      const stmt = getDatabase().prepare(`
        INSERT INTO leads (id, instagramHandle, fullName, bio, category, followerCount, isBusiness, funnelType, pipelineStatus, channelState, icpSegment, icpScore, targetService, location, externalUrl, whatsappNumber, notes, metaMessageId, lastContactAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        lead.id, lead.instagramHandle, lead.fullName || null, lead.bio || null,
        lead.category || null, lead.followerCount || 0, lead.isBusiness ? 1 : 0,
        lead.funnelType || 'customer', lead.pipelineStatus || 'discovered',
        lead.channelState || 'browser_contact_pending', lead.icpSegment || null,
        lead.icpScore || 50, lead.targetService || null, lead.location || null,
        lead.externalUrl || null, lead.whatsappNumber || null, lead.notes || null,
        lead.metaMessageId || null, lead.lastContactAt || null, lead.createdAt, lead.updatedAt
      );
    },
    update: (id: string, data: Partial<Lead>) => {
      const current = db.leads.getById(id);
      if (!current) return null;
      const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
      const stmt = getDatabase().prepare(`
        UPDATE leads SET
          fullName = ?, bio = ?, category = ?, followerCount = ?, isBusiness = ?,
          funnelType = ?, pipelineStatus = ?, channelState = ?, icpSegment = ?,
          icpScore = ?, targetService = ?, location = ?, externalUrl = ?,
          whatsappNumber = ?, notes = ?, metaMessageId = ?, lastContactAt = ?, updatedAt = ?
        WHERE id = ?
      `);
      stmt.run(
        updated.fullName ?? null,
        updated.bio ?? null,
        updated.category ?? null,
        updated.followerCount ?? 0,
        updated.isBusiness ? 1 : 0,
        updated.funnelType ?? 'customer',
        updated.pipelineStatus ?? 'discovered',
        updated.channelState ?? 'browser_contact_pending',
        updated.icpSegment ?? null,
        updated.icpScore ?? 50,
        updated.targetService ?? null,
        updated.location ?? null,
        updated.externalUrl ?? null,
        updated.whatsappNumber ?? null,
        updated.notes ?? null,
        updated.metaMessageId ?? null,
        updated.lastContactAt ?? null,
        updated.updatedAt,
        id
      );
      return updated;
    },
    delete: (id: string) => {
      getDatabase().prepare('DELETE FROM messages WHERE leadId = ?').run(id);
      getDatabase().prepare('DELETE FROM leads WHERE id = ?').run(id);
    },
    deleteAll: () => {
      getDatabase().prepare('DELETE FROM messages').run();
      getDatabase().prepare('DELETE FROM leads').run();
    }
  },

  messages: {
    getByLeadId: (leadId: string) => getDatabase().prepare('SELECT * FROM messages WHERE leadId = ? ORDER BY createdAt ASC').all(leadId) as unknown as Message[],
    getAll: () => getDatabase().prepare('SELECT * FROM messages ORDER BY createdAt DESC').all() as unknown as Message[],
    insert: (msg: Partial<Message> & { id: string; leadId: string; sender: string; channel: string; content: string; createdAt: string }) => {
      const stmt = getDatabase().prepare(`
        INSERT INTO messages (id, leadId, sender, channel, content, metaMessageId, variantId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        msg.id, msg.leadId, msg.sender, msg.channel, msg.content,
        msg.metaMessageId || null, msg.variantId || null, msg.createdAt
      );
    }
  },

  aiCalls: {
    getAll: () => getDatabase().prepare('SELECT * FROM ai_calls ORDER BY createdAt DESC').all() as unknown as AiCall[],
    getStats: () => {
      const row = getDatabase().prepare(`
        SELECT COUNT(*) as totalCalls,
               COALESCE(SUM(promptTokens + candidateTokens), 0) as totalTokens,
               COALESCE(SUM(estimatedCostUsd), 0.0) as totalCostUsd
        FROM ai_calls
      `).get() as { totalCalls: number; totalTokens: number; totalCostUsd: number };
      return row || { totalCalls: 0, totalTokens: 0, totalCostUsd: 0 };
    },
    insert: (call: AiCall) => {
      const stmt = getDatabase().prepare(`
        INSERT INTO ai_calls (id, leadId, model, promptTokens, candidateTokens, totalTokens, estimatedCostUsd, purpose, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        call.id,
        call.leadId ?? null,
        call.model,
        call.promptTokens ?? 0,
        call.candidateTokens ?? 0,
        (call.promptTokens ?? 0) + (call.candidateTokens ?? 0),
        call.estimatedCostUsd ?? 0,
        call.purpose,
        call.createdAt
      );
    }
  }
};
