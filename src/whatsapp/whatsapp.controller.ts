import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ConversationService } from '../conversation/conversation.service';
import { WhatsappService } from './whatsapp.service';
import {
  ParsedWebhookMessage,
  WhatsAppWebhookPayload,
} from './whatsapp.types';

@Controller('webhook')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsappService,
    private readonly conversationService: ConversationService,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ): string {
    const expectedToken = this.configService.get<string>(
      'WHATSAPP_VERIFY_TOKEN',
    );

    if (!mode || !challenge || !verifyToken) {
      this.logger.warn('Webhook verification missing required query params');
      throw new BadRequestException('Missing verification parameters');
    }

    if (mode !== 'subscribe') {
      this.logger.warn(`Invalid hub.mode received: ${mode}`);
      throw new BadRequestException('Invalid hub.mode');
    }

    if (!expectedToken || verifyToken !== expectedToken) {
      this.logger.warn('Webhook verification token mismatch');
      throw new ForbiddenException('Invalid verify token');
    }

    this.logger.log('Webhook verified successfully');
    return challenge;
  }

  @Post()
  @HttpCode(200)
  receiveWebhook(@Req() req: Request): { status: string } {
    const payload = req.body as WhatsAppWebhookPayload;

    if (!this.isValidWebhookPayload(payload)) {
      this.logger.warn('Invalid webhook payload received');
      throw new BadRequestException('Invalid webhook payload');
    }

    const messages = this.extractMessages(payload);

    for (const message of messages) {
      void this.processMessageAsync(message);
    }

    return { status: 'ok' };
  }

  private isValidWebhookPayload(
    payload: WhatsAppWebhookPayload,
  ): payload is WhatsAppWebhookPayload {
    return (
      payload?.object === 'whatsapp_business_account' &&
      Array.isArray(payload.entry) &&
      payload.entry.length > 0
    );
  }

  private extractMessages(
    payload: WhatsAppWebhookPayload,
  ): ParsedWebhookMessage[] {
    const messages: ParsedWebhookMessage[] = [];

    for (const entry of payload.entry) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'messages') {
          continue;
        }

        for (const message of change.value?.messages ?? []) {
          if (message.type !== 'text' || !message.text?.body) {
            this.logger.debug(
              `Skipping non-text message ${message.id} from ${message.from}`,
            );
            continue;
          }

          if (!message.from || !message.id || !message.timestamp) {
            this.logger.warn('Message missing required fields, skipping');
            continue;
          }

          messages.push({
            phoneNumber: message.from,
            messageId: message.id,
            messageText: message.text.body,
            timestamp: message.timestamp,
          });
        }
      }
    }

    return messages;
  }

  private async processMessageAsync(
    message: ParsedWebhookMessage,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing message ${message.messageId} from ${message.phoneNumber}`,
      );

      const reply = await this.conversationService.handleIncomingMessage({
        phoneNumber: message.phoneNumber,
        messageId: message.messageId,
        messageText: message.messageText,
        timestamp: message.timestamp,
      });

      await this.whatsappService.sendTextMessage(
        message.phoneNumber,
        reply,
      );
    } catch (error) {
      this.logger.error(
        `Async message processing failed for ${message.messageId}`,
        error instanceof Error ? error.stack : String(error),
      );

      try {
        await this.whatsappService.sendTextMessage(
          message.phoneNumber,
          'Sorry, something went wrong. Please try again in a moment.',
        );
      } catch (sendError) {
        this.logger.error(
          `Failed to send error message to ${message.phoneNumber}`,
          sendError instanceof Error ? sendError.stack : String(sendError),
        );
      }
    }
  }
}
