# WhatsApp Order Bot

A NestJS chatbot that integrates with the **Meta WhatsApp Cloud API** and **Supabase** to automate order creation through a guided, deterministic conversation flow.

Built for a water delivery business but designed to be extensible for other products.

## Features

- Webhook verification and event handling (Meta WhatsApp Cloud API)
- Deterministic state machine conversation engine (Strategy pattern)
- Session persistence in Supabase (survives server restarts)
- Order storage and confirmation flow
- Async message processing (immediate `200 OK` response)
- Strongly typed, production-ready NestJS architecture

## Stack

- NestJS + TypeScript
- Supabase (PostgreSQL)
- Meta WhatsApp Cloud API v23.0
- `@nestjs/config` for environment variables

## Project Structure

```
src/
├── whatsapp/           # Webhook controller + WhatsApp API client
├── conversation/       # State machine, handlers, session management
├── orders/             # Order creation and repository
├── database/           # Supabase client
└── common/             # DTOs, interfaces, enums
```

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Meta WhatsApp Business](https://developers.facebook.com/docs/whatsapp/cloud-api) app with:
  - Permanent access token
  - Phone number ID
  - Webhook configured

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `3000`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `WHATSAPP_ACCESS_TOKEN` | Meta Graph API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID |
| `WHATSAPP_VERIFY_TOKEN` | Custom token for webhook verification |
| `WHATSAPP_API_VERSION` | Graph API version (default: `v23.0`) |

### 3. Run database migrations

Apply the SQL scripts in order via the Supabase SQL Editor or CLI:

```bash
# Using Supabase CLI (optional)
supabase db push
```

Or run manually:

1. `supabase/migrations/001_create_sessions.sql`
2. `supabase/migrations/002_create_orders.sql`

### 4. Start the server

```bash
npm run start:dev
```

The webhook endpoints will be available at:

- `GET  /webhook` — Meta webhook verification
- `POST /webhook` — Incoming WhatsApp messages

### 5. Expose locally with ngrok (for Meta webhook testing)

```bash
ngrok http 3000
```

Configure your Meta app webhook URL as:

```
https://<your-ngrok-subdomain>.ngrok.io/webhook
```

Use the same `WHATSAPP_VERIFY_TOKEN` value in both `.env` and the Meta dashboard.

## Conversation Flow

| State | User Input | Bot Response |
|---|---|---|
| `START` | "hello" | Welcome + product menu |
| `ASK_PRODUCT` | "1" | "How many gallons would you like?" |
| `ASK_QUANTITY` | "3" | "Please send your delivery address." |
| `ASK_ADDRESS` | "123 Main Street" | "What delivery time do you prefer?" |
| `ASK_DELIVERY_TIME` | "5 PM" | Order summary + "Reply YES to confirm." |
| `CONFIRM_ORDER` | "YES" | "Your order has been created successfully." |
| `COMPLETED` | any | Starts a new order flow |

## Extending the State Machine

Each conversation step is a separate handler class implementing `StateHandler`:

```typescript
// src/conversation/handlers/my-new-step.handler.ts
@Injectable()
export class MyNewStepHandler implements StateHandler {
  readonly state = ConversationState.MY_NEW_STEP;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    // validate input, update conversationData, return next state + reply
  }
}
```

Register the handler in `ConversationModule` and add it to `StateMachineService`'s constructor. No switch statements required.

## Testing

### Webhook verification

```bash
curl -X GET "http://localhost:3000/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=YOUR_VERIFY_TOKEN"
# Expected: test123
```

### Simulate incoming message

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d @examples/webhook-payload.json
```

See `examples/curl-commands.sh` for a full conversation simulation.

### Example webhook payload

See `examples/webhook-payload.json` for a realistic Meta WhatsApp Cloud API payload.

## Error Handling

The bot handles:

- Unknown conversation states (resets session)
- Invalid user responses (re-prompts with guidance)
- Missing webhook payload fields (returns `400`)
- Meta API failures (logged, user receives fallback message)
- Database failures (logged, user receives fallback message)

## Scripts

```bash
npm run start:dev    # Development with hot reload
npm run build        # Compile TypeScript
npm run start:prod   # Run compiled app
npm run test         # Unit tests
npm run lint         # ESLint
```

## License

UNLICENSED
