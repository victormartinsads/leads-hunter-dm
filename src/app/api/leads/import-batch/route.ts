import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { discoverRealInstagramLeadsOverCdp, checkChromeCdpStatus } from '@/integrations/browser/playwright';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, hashtag, handles, quantity = 20, funnelType = 'customer' } = body;

    const countToImport = Math.min(Math.max(Number(quantity) || 20, 1), 100);
    const importedLeads: any[] = [];
    const now = new Date().toISOString();

    let targetProfiles: { handle: string; fullName?: string; bio?: string; followerCount?: number }[] = [];

    if (mode === 'handles' && handles) {
      // 1. User pasted a list of REAL Instagram handles
      const parsedHandles = handles
        .split(/[\n,;]+/)
        .map((h: string) => h.trim())
        .filter((h: string) => h.length > 0)
        .map((h: string) => h.startsWith('@') ? h : '@' + h);

      targetProfiles = parsedHandles.slice(0, countToImport).map((h: string) => ({
        handle: h,
        fullName: h.replace('@', '').toUpperCase(),
        bio: 'Perfil real do Instagram adicionado para prospecção',
        followerCount: 0
      }));

    } else if (mode === 'hashtag' && hashtag) {
      // 2. Real Instagram Search over Chrome CDP
      const cdpStatus = await checkChromeCdpStatus();
      if (cdpStatus.online) {
        const realScrape = await discoverRealInstagramLeadsOverCdp(hashtag, countToImport);
        if (realScrape.success && realScrape.handles.length > 0) {
          targetProfiles = realScrape.handles;
        }
      }

      // If Chrome CDP was not open or returned 0, inform user to open Chrome or paste handles
      if (targetProfiles.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'O Chrome dedicado não está aberto na porta 9222 para realizar a busca REAL no Instagram. Abra o Chrome no terminal clicando em "Abrir Chrome (1-Clique)" ou selecione a opção "@ Lista de Handles" para colar os perfis reais que deseja prospectar.'
        }, { status: 400 });
      }
    }

    // Insert real leads into database
    for (const item of targetProfiles) {
      const existing = db.leads.getByHandle(item.handle);
      if (existing) continue;

      const newLead = {
        id: 'lead_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        instagramHandle: item.handle,
        fullName: item.fullName || item.handle.replace('@', ''),
        bio: item.bio || 'Perfil real do Instagram adicionado para qualificação ICP.',
        followerCount: item.followerCount || 0,
        isBusiness: true,
        icpScore: 85,
        priority: 'high',
        funnelType,
        pipelineStatus: 'discovered',
        channelState: 'browser_contact_pending',
        notes: `Perfil real capturado para o nicho ${hashtag || 'lista'}.`,
        tags: JSON.stringify(['Perfil Real', 'Instagram']),
        lastContactAt: null,
        nextActionAt: new Date(Date.now() + 3600000 * 2).toISOString(),
        createdAt: now,
        updatedAt: now,
      };

      db.leads.insert(newLead);
      importedLeads.push(newLead);
    }

    return NextResponse.json({
      success: true,
      message: `${importedLeads.length} perfis REAIS do Instagram foram adicionados à fila de aprovação!`,
      leads: importedLeads
    });
  } catch (error: any) {
    console.error('Error importing batch:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
