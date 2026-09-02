import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

export function formatDateBR(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getPipelineStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'discovered':
      return { label: 'Descoberto', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    case 'qualified':
      return { label: 'Qualificado', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'contacted':
      return { label: 'Abordado (1ª DM)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'replied':
      return { label: 'Respondeu', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'interested':
      return { label: 'Interessado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'whatsapp_handoff':
    case 'joined_affiliate_group':
      return { label: 'No WhatsApp / Grupo', color: 'bg-green-100 text-green-800 border-green-300' };
    case 'registered':
    case 'active_affiliate':
      return { label: 'Cadastrado / Ativo', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    case 'active_customer':
    case 'generated_customer':
      return { label: 'Cliente Ativo 🚀', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold' };
    case 'closed':
    case 'do_not_contact':
      return { label: 'Encerrado / Sem Contato', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
}

export function getChannelStateLabel(state: string): { label: string; color: string } {
  switch (state) {
    case 'browser_contact_pending':
      return { label: 'Pendente Navegador', color: 'text-amber-600 bg-amber-50' };
    case 'browser_contact_sent':
    case 'waiting_inbound_reply':
      return { label: 'Aguardando Resposta', color: 'text-blue-600 bg-blue-50' };
    case 'api_eligible':
    case 'api_active':
      return { label: 'API Meta Ativa', color: 'text-purple-600 bg-purple-50' };
    case 'api_window_closed':
      return { label: 'Janela 24h Expirada', color: 'text-orange-600 bg-orange-50' };
    case 'human_review_required':
      return { label: 'Revisão Humana', color: 'text-red-600 bg-red-50' };
    case 'do_not_contact':
      return { label: 'Não Contatar', color: 'text-rose-700 bg-rose-100' };
    case 'completed':
      return { label: 'Concluído', color: 'text-emerald-700 bg-emerald-50' };
    default:
      return { label: state, color: 'text-gray-600 bg-gray-50' };
  }
}
