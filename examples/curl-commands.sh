#!/usr/bin/env bash
# Example curl commands for local testing
# Replace YOUR_VERIFY_TOKEN with the value from .env

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== Webhook verification (GET) ==="
curl -s -X GET "${BASE_URL}/webhook?hub.mode=subscribe&hub.challenge=test_challenge_123&hub.verify_token=YOUR_VERIFY_TOKEN"
echo -e "\n"

echo "=== Incoming text message (POST) ==="
curl -s -X POST "${BASE_URL}/webhook" \
  -H "Content-Type: application/json" \
  -d @examples/webhook-payload.json
echo -e "\n"

echo "=== Product selection ==="
curl -s -X POST "${BASE_URL}/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "messages": [{
            "from": "15559876543",
            "id": "wamid.test.product",
            "timestamp": "1718300001",
            "type": "text",
            "text": { "body": "1" }
          }]
        }
      }]
    }]
  }'
echo -e "\n"

echo "=== Order confirmation ==="
curl -s -X POST "${BASE_URL}/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "messages": [{
            "from": "15559876543",
            "id": "wamid.test.confirm",
            "timestamp": "1718300006",
            "type": "text",
            "text": { "body": "YES" }
          }]
        }
      }]
    }]
  }'
echo -e "\n"
