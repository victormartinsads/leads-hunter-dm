import { NextRequest, NextResponse } from 'next/server';
import { runPendingJobs } from '@/worker/runner';

export async function POST(req: NextRequest) {
  try {
    const result = await runPendingJobs();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = await runPendingJobs();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
