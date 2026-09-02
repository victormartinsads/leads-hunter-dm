export interface Lead {
  id: string;
  instagramHandle: string;
  fullName: string | null;
  bio: string | null;
  followerCount: number;
  isBusiness: boolean;
  icpScore: number;
  priority: string;
  funnelType: string;
  pipelineStatus: string;
  channelState: string;
  metaLeadId: string | null;
  whatsappPhone: string | null;
  notes: string | null;
  tags: string;
  lastContactAt: string | null;
  nextActionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  leadId: string;
  sender: string; // 'agent' | 'lead' | 'operator'
  channel: string; // 'browser' | 'meta_api' | 'whatsapp' | 'manual'
  content: string;
  variant: string | null;
  claimsUsed: string; // JSON array
  intentDetected: string | null;
  sentAt: string;
  createdAt: string;
}

export interface AiCall {
  id: string;
  leadId: string | null;
  model: string;
  promptTokens: number;
  candidateTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  purpose: string;
  createdAt: string;
}

export interface Job {
  id: string;
  type: string;
  payload: string;
  status: string;
  runAt: string;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  leadId: string | null;
  details: string | null;
  createdAt: string;
}
