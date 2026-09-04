import { NextResponse } from 'next/server';
import { db } from '@/db';
import { getBusinessConfig } from '@/lib/business-config';

export async function GET() {
  try {
    const config = getBusinessConfig();
    const allLeads = db.leads.getAll();
    const allMessages = db.messages.getAll();
    const aiStats = db.aiCalls.getStats();

    const totalLeads = allLeads.length;
    const contactedCount = allLeads.filter(l => l.pipelineStatus !== 'discovered').length;
    const repliedCount = allLeads.filter(l => ['replied', 'interested', 'whatsapp_handoff', 'registered', 'active_customer', 'joined_affiliate_group', 'active_affiliate', 'generated_customer'].includes(l.pipelineStatus)).length;
    const whatsappCount = allLeads.filter(l => ['whatsapp_handoff', 'registered', 'active_customer', 'joined_affiliate_group', 'active_affiliate', 'generated_customer'].includes(l.pipelineStatus)).length;
    const activeCustomerCount = allLeads.filter(l => ['active_customer', 'generated_customer'].includes(l.pipelineStatus)).length;

    const responseRate = contactedCount > 0 ? (repliedCount / contactedCount) * 100 : 0;
    const whatsappRate = contactedCount > 0 ? (whatsappCount / contactedCount) * 100 : 0;
    
    const costPerLeadUsd = contactedCount > 0 ? (aiStats.totalCostUsd / contactedCount) : 0;
    const costPerCustomerUsd = activeCustomerCount > 0 ? (aiStats.totalCostUsd / activeCustomerCount) : (aiStats.totalCostUsd || 0);

    const budgetLimitUsd = parseFloat(process.env.OPENAI_MONTHLY_BUDGET_USD || process.env.GEMINI_MONTHLY_BUDGET_USD || '50.00');
    const budgetUsedPercent = budgetLimitUsd > 0 ? Math.min(100, (aiStats.totalCostUsd / budgetLimitUsd) * 100) : 0;

    const recentMessages = allMessages.slice(0, 5);
    const recentLeads = allLeads.slice(0, 5);

    let chromeStatus = 'offline';
    try {
      const cdpUrl = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';
      const cdpRes = await fetch(`${cdpUrl}/json/version`, { signal: AbortSignal.timeout(1200) });
      if (cdpRes.ok) chromeStatus = 'online';
    } catch {
      chromeStatus = 'offline_simulated';
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalLeads,
        contactedCount,
        repliedCount,
        whatsappCount,
        activeCustomerCount,
        responseRate: responseRate.toFixed(1),
        whatsappRate: whatsappRate.toFixed(1),
        ai: {
          totalCalls: aiStats.totalCalls,
          totalTokens: aiStats.totalTokens,
          totalCostUsd: aiStats.totalCostUsd,
          totalCostBrl: (aiStats.totalCostUsd * 5.8).toFixed(2),
          costPerLeadUsd: costPerLeadUsd.toFixed(4),
          costPerCustomerUsd: costPerCustomerUsd.toFixed(4),
          budgetLimitUsd,
          budgetUsedPercent: budgetUsedPercent.toFixed(1)
        }
      },
      aiStats: {
        totalCalls: aiStats.totalCalls,
        totalTokens: aiStats.totalTokens,
        totalCostUsd: aiStats.totalCostUsd
      },
      system: {
        paused: config.SYSTEM_PAUSED ?? false,
        chromeStatus,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        budgetLimitUsd,
        maxDmsPerDay: config.MAX_DMS_PER_DAY,
        operatingHours: config.OPERATING_HOURS,
        verifiedClaimsCount: config.VERIFIED_CLAIMS?.length || 0,
        unverifiedClaimsCount: config.UNVERIFIED_CLAIMS?.length || 0
      },
      recentMessages,
      recentLeads,
      allLeads
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
