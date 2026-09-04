import { getBusinessConfig } from '@/lib/business-config';

export interface SendMetaApiMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendInstagramMessageViaMetaApi(
  recipientMetaId: string,
  messageText: string
): Promise<SendMetaApiMessageResult> {
  const pageAccessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const instagramAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!pageAccessToken || !instagramAccountId) {
    return {
      success: false,
      error: 'INSTAGRAM_API_NOT_CONFIGURED: INSTAGRAM_PAGE_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ACCOUNT_ID devem estar configurados no .env para envios da Etapa 2.'
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${instagramAccountId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pageAccessToken}`
      },
      body: JSON.stringify({
        recipient: { id: recipientMetaId },
        message: { text: messageText }
      })
    });

    const data = await response.json();

    if (response.ok && data.message_id) {
      return {
        success: true,
        messageId: data.message_id
      };
    }

    return {
      success: false,
      error: data.error?.message || 'Falha ao enviar mensagem pela API Oficial da Meta.'
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Erro de conexão na API Oficial da Meta: ${error.message}`
    };
  }
}
