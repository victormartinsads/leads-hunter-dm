import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { Lead, Message, AiCall, Job, AuditLog } from './schema';

// Ensure data directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'buscandomilhao.sqlite');

// Global singleton to prevent multiple instances in Next.js hot reloading
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
      followerCount INTEGER DEFAULT 0,
      isBusiness INTEGER DEFAULT 1,
      icpScore INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      funnelType TEXT DEFAULT 'customer',
      pipelineStatus TEXT NOT NULL DEFAULT 'discovered',
      channelState TEXT NOT NULL DEFAULT 'browser_contact_pending',
      metaLeadId TEXT,
      whatsappPhone TEXT,
      notes TEXT,
      tags TEXT DEFAULT '[]',
      lastContactAt TEXT,
      nextActionAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      leadId TEXT NOT NULL,
      sender TEXT NOT NULL,
      channel TEXT NOT NULL,
      content TEXT NOT NULL,
      variant TEXT,
      claimsUsed TEXT DEFAULT '[]',
      intentDetected TEXT,
      sentAt TEXT NOT NULL,
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
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      runAt TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      maxAttempts INTEGER DEFAULT 3,
      lastError TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      leadId TEXT,
      details TEXT,
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
      instagramHandle: '@loja.bellamoda',
      fullName: 'Bella Moda Feminina',
      bio: 'Moda feminina e tendências | Enviamos para todo Brasil | WhatsApp no link',
      followerCount: 14200,
      isBusiness: 1,
      icpScore: 92,
      priority: 'high',
      funnelType: 'customer',
      pipelineStatus: 'contacted',
      channelState: 'waiting_inbound_reply',
      notes: 'Loja com alto engajamento em reels de provador. ICP perfeito.',
      tags: JSON.stringify(['Moda', 'E-commerce', 'Decisor: Loja']),
      lastContactAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      nextActionAt: new Date(Date.now() + 3600000 * 20).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: now,
    },
    {
      id: 'lead_2',
      instagramHandle: '@dr.carloseduardo',
      fullName: 'Dr. Carlos Eduardo | Harmonização',
      bio: 'Cirurgião Dentista | Especialista em Harmonização Facial | São Paulo - SP',
      followerCount: 8900,
      isBusiness: 1,
      icpScore: 88,
      priority: 'high',
      funnelType: 'customer',
      pipelineStatus: 'replied',
      channelState: 'api_eligible',
      notes: 'Respondeu perguntando como funciona a automação para clínicas.',
      tags: JSON.stringify(['Saúde', 'Estética', 'Decisor: Dono']),
      lastContactAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      nextActionAt: new Date(Date.now() + 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: now,
    },
    {
      id: 'lead_3',
      instagramHandle: '@agencia_vortice',
      fullName: 'Agência Vórtice Digital',
      bio: 'Estratégia de tráfego pago e escala de faturamento para e-commerce',
      followerCount: 22500,
      isBusiness: 1,
      icpScore: 95,
      priority: 'urgent',
      funnelType: 'customer',
      pipelineStatus: 'whatsapp_handoff',
      channelState: 'completed',
      notes: 'Demonstrou forte interesse, pediu link do WhatsApp e já iniciou conversa.',
      tags: JSON.stringify(['Agência', 'Tráfego', 'WhatsApp Enviado']),
      lastContactAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      nextActionAt: null,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: now,
    },
    {
      id: 'lead_4',
      instagramHandle: '@carol.vendasdigitais',
      fullName: 'Carol Silveira',
      bio: 'Criadora de conteúdo | Dicas diárias de prospecção e vendas online 🚀',
      followerCount: 45000,
      isBusiness: 0,
      icpScore: 85,
      priority: 'medium',
      funnelType: 'affiliate',
      pipelineStatus: 'interested',
      channelState: 'api_active',
      notes: 'Influenciadora com público de pequenos lojistas. Excelente fit para afiliados.',
      tags: JSON.stringify(['Criador', 'Afiliado', 'Audiência Qualificada']),
      lastContactAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      nextActionAt: new Date(Date.now() + 3600000 * 12).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: now,
    },
    {
      id: 'lead_5',
      instagramHandle: '@studio.glowestetica',
      fullName: 'Studio Glow Estética | Jardim Ângela SP',
      bio: 'GLOW ESTÉTICA | Jardim Ângela SP | Limpeza de pele, depilação e estética corporal',
      followerCount: 37,
      isBusiness: 1,
      icpScore: 78,
      priority: 'low',
      funnelType: 'customer',
      pipelineStatus: 'discovered',
      channelState: 'browser_contact_pending',
      notes: 'Encontrado pela hashtag #esteticacuritiba. Aguardando qualificação para envio de 1ª DM.',
      tags: JSON.stringify(['Estética', 'Local']),
      lastContactAt: null,
      nextActionAt: new Date(Date.now() + 3600000 * 5).toISOString(),
      createdAt: now,
      updatedAt: now,
    }
  ];

  const insertLeadStmt = sqlite.prepare(`
    INSERT INTO leads (id, instagramHandle, fullName, bio, followerCount, isBusiness, icpScore, priority, funnelType, pipelineStatus, channelState, notes, tags, lastContactAt, nextActionAt, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of sampleLeads) {
    insertLeadStmt.run(
      l.id, l.instagramHandle, l.fullName, l.bio, l.followerCount, l.isBusiness,
      l.icpScore, l.priority, l.funnelType, l.pipelineStatus, l.channelState,
      l.notes, l.tags, l.lastContactAt, l.nextActionAt, l.createdAt, l.updatedAt
    );
  }

  const insertMsgStmt = sqlite.prepare(`
    INSERT INTO messages (id, leadId, sender, channel, content, variant, claimsUsed, intentDetected, sentAt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMsgStmt.run('msg_1', 'lead_1', 'agent', 'browser', 'Oi Bella! Vi o provador da nova coleção que você postou ontem no reels, ficou muito profissional. Vocês tão conseguindo dar conta dos pedidos que chegam pelo direct?', 'A_casual_compliment', JSON.stringify(['Sistema opera 100% local']), null, new Date(Date.now() - 3600000 * 4).toISOString(), new Date(Date.now() - 3600000 * 4).toISOString());
  insertMsgStmt.run('msg_2', 'lead_2', 'agent', 'browser', 'Olá Dr. Carlos, tudo bem? Vi seu conteúdo sobre planejamento facial digital. A sua clínica hoje perde muito tempo fazendo triagem de pacientes curiosos no Instagram?', 'B_problem_aware', JSON.stringify(['A primeira mensagem sai pelo navegador real']), null, new Date(Date.now() - 3600000 * 5).toISOString(), new Date(Date.now() - 3600000 * 5).toISOString());
  insertMsgStmt.run('msg_3', 'lead_2', 'lead', 'meta_api', 'Olá! Sim, perdemos bastante tempo com isso aqui na clínica. Como funciona a solução de vocês?', null, '[]', 'asked_info', new Date(Date.now() - 3600000 * 2).toISOString(), new Date(Date.now() - 3600000 * 2).toISOString());
  insertMsgStmt.run('msg_4', 'lead_3', 'agent', 'browser', 'Fala pessoal da Vórtice! Acompanho o trabalho de vocês na escala de e-commerce. Parabéns pelos cases postados!', 'A_casual_compliment', '[]', null, new Date(Date.now() - 3600000 * 10).toISOString(), new Date(Date.now() - 3600000 * 10).toISOString());
  insertMsgStmt.run('msg_5', 'lead_3', 'lead', 'meta_api', 'Show de bola! Valeu demais. Vocês têm alguma ferramenta pra ajudar nosso time de prospecção?', null, '[]', 'interested', new Date(Date.now() - 3600000 * 3).toISOString(), new Date(Date.now() - 3600000 * 3).toISOString());
  insertMsgStmt.run('msg_6', 'lead_3', 'agent', 'meta_api', 'Temos sim! Desenvolvemos um agente autônomo com IA Gemini que prospecta pelo direct e transfere os qualificados direto pro WhatsApp. Me chama no Whats que te mostro como funciona: https://wa.me/5511999999999', 'C_whatsapp_cta', JSON.stringify(['Utiliza inteligência artificial Google Gemini para geração de mensagens personalizadas.']), 'wants_whatsapp', new Date(Date.now() - 3600000 * 1).toISOString(), new Date(Date.now() - 3600000 * 1).toISOString());

  const insertAiStmt = sqlite.prepare(`
    INSERT INTO ai_calls (id, leadId, model, promptTokens, candidateTokens, totalTokens, estimatedCostUsd, purpose, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAiStmt.run('call_1', 'lead_1', 'gemini-2.5-flash', 420, 65, 485, 0.000068, 'icebreaker', new Date(Date.now() - 3600000 * 4).toISOString());
  insertAiStmt.run('call_2', 'lead_2', 'gemini-2.5-flash', 380, 52, 432, 0.000060, 'icebreaker', new Date(Date.now() - 3600000 * 5).toISOString());
  insertAiStmt.run('call_3', 'lead_2', 'gemini-2.5-flash', 510, 84, 594, 0.000085, 'classification', new Date(Date.now() - 3600000 * 2).toISOString());
}

// Database helper functions
export const db = {
  getSqlite: () => getDatabase(),

  leads: {
    getAll: () => getDatabase().prepare('SELECT * FROM leads ORDER BY updatedAt DESC').all() as unknown as Lead[],
    getById: (id: string) => getDatabase().prepare('SELECT * FROM leads WHERE id = ?').get(id) as unknown as Lead | undefined,
    getByHandle: (handle: string) => getDatabase().prepare('SELECT * FROM leads WHERE instagramHandle = ?').get(handle) as unknown as Lead | undefined,
    insert: (lead: Partial<Lead> & { id: string; instagramHandle: string; createdAt: string; updatedAt: string }) => {
      const stmt = getDatabase().prepare(`
        INSERT INTO leads (id, instagramHandle, fullName, bio, followerCount, isBusiness, icpScore, priority, funnelType, pipelineStatus, channelState, metaLeadId, whatsappPhone, notes, tags, lastContactAt, nextActionAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        lead.id, lead.instagramHandle, lead.fullName || null, lead.bio || null,
        lead.followerCount || 0, lead.isBusiness ? 1 : 0, lead.icpScore || 0,
        lead.priority || 'medium', lead.funnelType || 'customer',
        lead.pipelineStatus || 'discovered', lead.channelState || 'browser_contact_pending',
        lead.metaLeadId || null, lead.whatsappPhone || null, lead.notes || null,
        lead.tags || '[]', lead.lastContactAt || null, lead.nextActionAt || null,
        lead.createdAt, lead.updatedAt
      );
    },
    update: (id: string, data: Partial<Lead>) => {
      const current = db.leads.getById(id);
      if (!current) return null;
      const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
      const stmt = getDatabase().prepare(`
        UPDATE leads SET
          fullName = ?, bio = ?, followerCount = ?, isBusiness = ?, icpScore = ?,
          priority = ?, funnelType = ?, pipelineStatus = ?, channelState = ?,
          metaLeadId = ?, whatsappPhone = ?, notes = ?, tags = ?,
          lastContactAt = ?, nextActionAt = ?, updatedAt = ?
        WHERE id = ?
      `);
      stmt.run(
        updated.fullName, updated.bio, updated.followerCount, updated.isBusiness ? 1 : 0,
        updated.icpScore, updated.priority, updated.funnelType, updated.pipelineStatus,
        updated.channelState, updated.metaLeadId, updated.whatsappPhone, updated.notes,
        updated.tags, updated.lastContactAt, updated.nextActionAt, updated.updatedAt,
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
    getByLeadId: (leadId: string) => getDatabase().prepare('SELECT * FROM messages WHERE leadId = ? ORDER BY sentAt ASC').all(leadId) as unknown as Message[],
    getAll: () => getDatabase().prepare('SELECT * FROM messages ORDER BY sentAt DESC').all() as unknown as Message[],
    insert: (msg: Partial<Message> & { id: string; leadId: string; sender: string; channel: string; content: string; sentAt: string; createdAt: string }) => {
      const stmt = getDatabase().prepare(`
        INSERT INTO messages (id, leadId, sender, channel, content, variant, claimsUsed, intentDetected, sentAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        msg.id, msg.leadId, msg.sender, msg.channel, msg.content,
        msg.variant || null, msg.claimsUsed || '[]', msg.intentDetected || null,
        msg.sentAt, msg.createdAt
      );
    }
  },

  aiCalls: {
    getAll: () => getDatabase().prepare('SELECT * FROM ai_calls ORDER BY createdAt DESC').all() as unknown as AiCall[],
    getStats: () => {
      const row = getDatabase().prepare(`
        SELECT COUNT(*) as totalCalls,
               COALESCE(SUM(totalTokens), 0) as totalTokens,
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
        call.id, call.leadId, call.model, call.promptTokens,
        call.candidateTokens, call.totalTokens, call.estimatedCostUsd,
        call.purpose, call.createdAt
      );
    }
  }
};
