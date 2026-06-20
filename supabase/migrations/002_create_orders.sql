-- DEPRECATED: this project already has an `orders` table used by another app.
-- Use 003_create_whatsapp_orders.sql instead.

-- WhatsApp bot orders (separate from existing `orders` table in this project)
CREATE TABLE IF NOT EXISTS whatsapp_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  address TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_phone_number
  ON whatsapp_orders (phone_number);

CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_created_at
  ON whatsapp_orders (created_at DESC);

DROP TRIGGER IF EXISTS whatsapp_orders_updated_at ON whatsapp_orders;
CREATE TRIGGER whatsapp_orders_updated_at
  BEFORE UPDATE ON whatsapp_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
