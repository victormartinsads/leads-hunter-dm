/**
 * Customer Pipeline Statuses:
 * discovered -> qualified -> contacted -> replied -> interested -> whatsapp_handoff -> registered -> active_customer -> closed
 *
 * Affiliate Pipeline Statuses:
 * discovered -> qualified -> contacted -> replied -> interested -> joined_affiliate_group -> active_affiliate -> generated_customer -> closed
 */

export interface Lead {
  id: string;
  instagramHandle: string;
  fullName?: string | null;
  bio?: string | null;
  category?: string | null;
  followerCount?: number;
  isBusiness?: boolean | number;
  
  // Pipeline & Funnel
  funnelType: 'customer' | 'affiliate';
  pipelineStatus: string;
  channelState?: string;
  channelStatus?: string;
  
  // Scoring & Offer Target
  icpSegment?: string | null;
  icpScore?: number;
  priority?: string | null;
  tags?: string | null;
  targetService?: string | null;
  
  // Contact details
  location?: string | null;
  externalUrl?: string | null;
  whatsappNumber?: string | null;
  notes?: string | null;
  
  // Audit & Timestamps
  metaMessageId?: string | null;
  lastContactedAt?: string | null;
  lastContactAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewLead = Partial<Lead> & { id: string; instagramHandle: string; createdAt: string; updatedAt: string };

export interface Message {
  id: string;
  leadId: string;
  sender: 'lead' | 'agent' | 'system' | string;
  channel: 'browser' | 'api' | string;
  content: string;
  metaMessageId?: string | null;
  variantId?: string | null;
  claimsUsed?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export type NewMessage = Partial<Message> & { id: string; leadId: string; sender: string; channel: string; content: string; createdAt: string };

export interface Job {
  id: string;
  type: 'browser_dm' | 'api_followup' | 'discover_leads' | 'budget_check' | string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | string;
  payload: string;
  retries?: number;
  lockedAt?: string | null;
  errorDetails?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiCall {
  id: string;
  leadId?: string | null;
  model: string;
  promptTokens: number;
  candidateTokens: number;
  totalTokens?: number;
  estimatedCostUsd: number;
  purpose: 'icebreaker' | 'classification' | 'objection_handling' | 'claim_audit' | string;
  createdAt: string;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: 'active' | 'paused' | 'concluded' | string;
  createdAt: string;
}

export interface ExperimentVariant {
  id: string;
  experimentId: string;
  name: string;
  promptTemplate: string;
  impressionsCount?: number;
  conversionsCount?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  event: string;
  severity: 'info' | 'warning' | 'error' | 'critical' | string;
  details: string;
  createdAt: string;
}
