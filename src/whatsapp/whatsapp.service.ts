import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WhatsAppSendMessageResponse,
  WhatsAppTextMessagePayload,
} from './whatsapp.types';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly configService: ConfigService) {}

  private isMockMode(): boolean {
    return this.configService.get<string>('WHATSAPP_MOCK') === 'true';
  }

  async sendTextMessage(to: string, body: string): Promise<void> {
    if (this.isMockMode()) {
      this.logger.log(`[MOCK WhatsApp] to=${to}\n${body}`);
      return;
    }

    const phoneNumberId = this.configService.get<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
    );
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    const apiVersion =
      this.configService.get<string>('WHATSAPP_API_VERSION') ?? 'v23.0';

    if (!phoneNumberId || !accessToken) {
      this.logger.error('WhatsApp API credentials are not configured');
      throw new Error('Missing WhatsApp API configuration');
    }

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const payload: WhatsAppTextMessagePayload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `WhatsApp API error (${response.status}): ${errorBody}`,
        );
        throw new Error(
          `WhatsApp API request failed with status ${response.status}`,
        );
      }

      const result = (await response.json()) as WhatsAppSendMessageResponse;
      this.logger.log(
        `Message sent to ${to}, id: ${result.messages?.[0]?.id ?? 'unknown'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp message to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
