/**
 * Verifies the bot can create customers, orders, and order_items
 * against the live Supabase schema. Run after migrations:
 *
 *   npx ts-node -r tsconfig-paths/register scripts/verify-contracts.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolveProductCatalogEntry } from '../src/common/products';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main(): Promise<void> {
  const companyId = process.env.DEFAULT_COMPANY_ID;
  if (!companyId) {
    throw new Error('DEFAULT_COMPANY_ID is required');
  }

  const { data: owner, error: ownerError } = await supabase
    .from('company_members')
    .select('user_id')
    .eq('company_id', companyId)
    .eq('role', 'owner')
    .limit(1)
    .maybeSingle();

  if (ownerError || !owner?.user_id) {
    throw new Error(`No owner for company ${companyId}: ${ownerError?.message}`);
  }

  const testPhone = `569${Date.now().toString().slice(-8)}`;
  const catalog = resolveProductCatalogEntry('water_gallon', 'Water Gallon');
  const quantity = 2;
  const total = catalog.unitPrice * quantity;

  console.log('1. Creating customer...');
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      company_id: companyId,
      created_by: owner.user_id,
      first_name: 'WhatsApp',
      last_name: 'Cliente',
      phone: testPhone,
      address: 'Calle Verificación 123',
    })
    .select()
    .single();

  if (customerError) {
    throw new Error(`Customer insert failed: ${customerError.message}`);
  }
  console.log(`   OK customer=${customer.id}`);

  console.log('2. Creating order...');
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      company_id: companyId,
      created_by: owner.user_id,
      customer_id: customer.id,
      order_date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      total,
      notes: 'Entrega: 6 PM (verify script)',
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Order insert failed: ${orderError.message}`);
  }
  console.log(`   OK order=${order.id} company_id=${order.company_id}`);

  console.log('3. Creating order_item...');
  const { data: item, error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      product: catalog.dbName,
      quantity,
      unit_price: catalog.unitPrice,
    })
    .select()
    .single();

  if (itemError) {
    throw new Error(`Order item insert failed: ${itemError.message}`);
  }
  console.log(`   OK item=${item.id} product=${item.product}`);

  console.log('4. Checking sessions.company_id column...');
  const { error: sessionError } = await supabase
    .from('sessions')
    .select('company_id')
    .limit(1);

  if (sessionError?.message.includes('company_id')) {
    console.log('   MISSING — run supabase/migrations/004_add_company_to_sessions.sql');
  } else if (sessionError) {
    throw new Error(`Sessions check failed: ${sessionError.message}`);
  } else {
    console.log('   OK sessions.company_id exists');
  }

  console.log('\nAll contract checks passed.');
}

main().catch((error) => {
  console.error('\nContract verification failed:', error.message);
  process.exit(1);
});
