import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { checkChromeCdpStatus } from '@/integrations/browser/playwright';

export async function GET() {
  const status = await checkChromeCdpStatus();
  return NextResponse.json({ success: true, status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'launch';

    if (action === 'launch') {
      // Check if already running
      const currentStatus = await checkChromeCdpStatus();
      if (currentStatus.online) {
        return NextResponse.json({
          success: true,
          message: 'O Chrome já está aberto e conectado na porta 9222!',
          alreadyRunning: true
        });
      }

      // Find Chrome executable path on Windows / macOS / Linux
      const profileDir = path.join(process.cwd(), '.chrome-profile');
      if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
      }

      let chromePath = '';
      const possibleWindowsPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
      ];

      for (const p of possibleWindowsPaths) {
        if (fs.existsSync(p)) {
          chromePath = p;
          break;
        }
      }

      if (!chromePath && process.platform === 'win32') {
        chromePath = 'chrome.exe'; // try PATH
      } else if (process.platform === 'darwin') {
        chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      } else if (process.platform === 'linux') {
        chromePath = 'google-chrome';
      }

      // Launch Chrome in background
      const args = [
        '--remote-debugging-port=9222',
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        'https://www.instagram.com'
      ];

      const child = spawn(chromePath, args, {
        detached: true,
        stdio: 'ignore'
      });

      child.unref();

      // Wait 2 seconds for Chrome to bind port
      await new Promise(r => setTimeout(r, 2000));

      const newStatus = await checkChromeCdpStatus();

      return NextResponse.json({
        success: true,
        message: newStatus.online
          ? 'Janela do Chrome aberta com sucesso! Faça login no Instagram nela.'
          : 'Comando de abertura do Chrome executado. Verifique a janela na sua barra de tarefas.',
        status: newStatus
      });
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('Error launching Chrome:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
