import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { WhatsappController } from '../src/whatsapp/whatsapp.controller';
import { WhatsappService } from '../src/whatsapp/whatsapp.service';
import { ConversationService } from '../src/conversation/conversation.service';

describe('Webhook (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [WhatsappController],
      providers: [
        {
          provide: WhatsappService,
          useValue: { sendTextMessage: jest.fn() },
        },
        {
          provide: ConversationService,
          useValue: { handleIncomingMessage: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/webhook (GET) returns challenge when token matches', () => {
    return request(app.getHttpServer())
      .get('/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.challenge': 'challenge_abc',
        'hub.verify_token': 'test-verify-token',
      })
      .expect(200)
      .expect('challenge_abc');
  });

  it('/webhook (GET) rejects invalid verify token', () => {
    return request(app.getHttpServer())
      .get('/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.challenge': 'challenge_abc',
        'hub.verify_token': 'wrong-token',
      })
      .expect(403);
  });

  it('/webhook (POST) returns 200 for valid payload', () => {
    return request(app.getHttpServer())
      .post('/webhook')
      .send({
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'test-entry',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '15551234567',
                    phone_number_id: '123',
                  },
                  messages: [
                    {
                      from: '15559876543',
                      id: 'msg-1',
                      timestamp: '1718300000',
                      type: 'text',
                      text: { body: 'hello' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      })
      .expect(200)
      .expect({ status: 'ok' });
  });
});
