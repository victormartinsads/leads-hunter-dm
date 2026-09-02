import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

export interface SendDmResult {
  success: boolean;
  message: string;
  screenshotPath?: string;
  isRealBrowser: boolean;
  error?: string;
}

// Global mutex to ensure only one browser automation runs at a time
let isBrowserBusy = false;

export async function checkChromeCdpStatus(): Promise<{ online: boolean; message: string }> {
  const cdpUrl = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';
  try {
    const res = await fetch(`${cdpUrl}/json/version`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, message: `Chrome conectado: ${data.Browser || 'OK'}` };
    }
  } catch (e: any) {
    // Offline or not responding
  }
  return {
    online: false,
    message: 'Chrome não está aberto com --remote-debugging-port=9222. Inicie o Chrome dedicado.'
  };
}

export async function sendInstagramDmOverCdp(
  targetHandle: string,
  messageText: string,
  options: { dryRun?: boolean } = {}
): Promise<SendDmResult> {
  const handle = targetHandle.replace('@', '').trim();
  const cdpUrl = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';

  if (isBrowserBusy) {
    return {
      success: false,
      isRealBrowser: false,
      message: 'O navegador está ocupado processando outra mensagem. Aguarde alguns segundos.'
    };
  }

  isBrowserBusy = true;

  try {
    // 1. Check if Chrome CDP is reachable
    const status = await checkChromeCdpStatus();
    if (!status.online) {
      return {
        success: false,
        isRealBrowser: false,
        message: 'Chrome com porta de debug (9222) não encontrado. Abra o Chrome no terminal primeiro.',
        error: 'CHROME_CDP_UNAVAILABLE'
      };
    }

    // 2. Connect to existing Chrome instance
    const browser = await chromium.connectOverCDP(cdpUrl);
    const context = browser.contexts()[0] || await browser.newContext();
    
    // Create dedicated agent tab (never touches user existing tabs)
    const page = await context.newPage();

    try {
      // 3. Navigate to target profile
      console.log(`[Browser CDP] Navegando até https://www.instagram.com/${handle}/`);
      await page.goto(`https://www.instagram.com/${handle}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Check if logged in
      const isLoginPage = page.url().includes('/accounts/login');
      if (isLoginPage) {
        return {
          success: false,
          isRealBrowser: true,
          message: 'Você ainda não está logado no Instagram no Chrome dedicado. Faça login na janela do Chrome aberta.',
          error: 'INSTAGRAM_NOT_LOGGED_IN'
        };
      }

      // Check if profile exists
      const pageTitle = await page.title();
      if (pageTitle.includes('Page Not Found') || pageTitle.includes('Página não encontrada')) {
        return {
          success: false,
          isRealBrowser: true,
          message: `O perfil @${handle} não foi encontrado no Instagram.`,
          error: 'PROFILE_NOT_FOUND'
        };
      }

      // 4. Click "Enviar mensagem" / "Message" button
      const messageBtnSelectors = [
        'div[role="button"]:has-text("Enviar mensagem")',
        'div[role="button"]:has-text("Message")',
        'button:has-text("Enviar mensagem")',
        'button:has-text("Message")',
        'a:has-text("Enviar mensagem")',
        'header section div:has-text("Enviar mensagem")',
      ];

      let clickedMessageBtn = false;
      for (const selector of messageBtnSelectors) {
        const btn = page.locator(selector).first();
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
          clickedMessageBtn = true;
          break;
        }
      }

      if (!clickedMessageBtn) {
        // Direct fallback to direct message URL
        console.log(`[Browser CDP] Abrindo direct inbox para @${handle}...`);
        await page.goto(`https://www.instagram.com/direct/new/`, { timeout: 20000 });
        await page.waitForTimeout(2000);
      }

      await page.waitForTimeout(2500);

      // 5. Locate chat input area
      const inputSelectors = [
        'div[role="textbox"][contenteditable="true"]',
        'textarea[placeholder*="Mensagem"]',
        'textarea[placeholder*="Message"]',
        'div[aria-label*="Mensagem"][contenteditable="true"]',
        'div[aria-label*="Message"][contenteditable="true"]'
      ];

      let inputElement = null;
      for (const sel of inputSelectors) {
        const el = page.locator(sel).first();
        if (await el.isVisible().catch(() => false)) {
          inputElement = el;
          break;
        }
      }

      if (!inputElement) {
        // Save failure screenshot for debugging
        const screenshotDir = path.join(process.cwd(), 'data', 'screenshots');
        if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
        const screenshotPath = path.join(screenshotDir, `fail_${handle}_${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath });

        return {
          success: false,
          isRealBrowser: true,
          message: `Não foi possível localizar o campo de texto do Direct para @${handle}. O perfil pode ter DMs bloqueadas para desconhecidos.`,
          screenshotPath,
          error: 'DIRECT_INPUT_NOT_FOUND'
        };
      }

      // 6. Focus and type human-like
      await inputElement.click();
      await page.waitForTimeout(500);

      if (options.dryRun) {
        console.log(`[Browser CDP] Modo Dry-Run ativo: digitação simulada sem envio real.`);
        return {
          success: true,
          isRealBrowser: true,
          message: `[Modo Simulação Realizada] Conectou ao perfil @${handle} e localizou o campo de envio com sucesso!`
        };
      }

      // Human-like typing delay (40-90ms per character)
      await inputElement.pressSequentially(messageText, { delay: 45 });
      await page.waitForTimeout(800);

      // 7. Press Enter to send
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      // Save confirmation screenshot
      const screenshotDir = path.join(process.cwd(), 'data', 'screenshots');
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
      const screenshotPath = path.join(screenshotDir, `sent_${handle}_${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath });

      return {
        success: true,
        isRealBrowser: true,
        message: `Mensagem real enviada com sucesso no Direct para @${handle}!`,
        screenshotPath
      };

    } finally {
      // Clean up tab
      await page.close().catch(() => {});
    }

  } catch (err: any) {
    console.error('Error in sendInstagramDmOverCdp:', err);
    return {
      success: false,
      isRealBrowser: false,
      message: `Erro na execução do navegador: ${err.message}`,
      error: err.message
    };
  } finally {
    isBrowserBusy = false;
  }
}
