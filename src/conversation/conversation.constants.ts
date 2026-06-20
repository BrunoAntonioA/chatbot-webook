export const PRODUCT_OPTIONS = {
  '1': { key: 'water_gallon' as const, label: 'Water Gallon' },
  '2': { key: 'water_pack' as const, label: 'Water Pack' },
  '3': { key: 'other' as const, label: 'Other' },
} as const;

export type ProductKey = (typeof PRODUCT_OPTIONS)[keyof typeof PRODUCT_OPTIONS]['key'];

export const WELCOME_MESSAGE =
  'Welcome. What would you like to order?\n\n1. Water Gallon\n2. Water Pack\n3. Other';

export function getQuantityPrompt(productKey?: string): string {
  if (productKey === 'water_gallon') {
    return 'How many gallons would you like?';
  }

  if (productKey === 'water_pack') {
    return 'How many packs would you like?';
  }

  return 'How many units would you like?';
}

export function buildOrderConfirmation(data: {
  product?: string;
  quantity?: number;
  address?: string;
  deliveryTime?: string;
}): string {
  return (
    'Please confirm:\n\n' +
    `Product: ${data.product ?? 'N/A'}\n` +
    `Quantity: ${data.quantity ?? 'N/A'}\n` +
    `Address: ${data.address ?? 'N/A'}\n` +
    `Time: ${data.deliveryTime ?? 'N/A'}\n\n` +
    'Reply YES to confirm.'
  );
}

export function isAffirmativeResponse(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return ['yes', 'y', 'confirm', 'ok', 'si', 'sí'].includes(normalized);
}

export function parseProductChoice(
  text: string,
): (typeof PRODUCT_OPTIONS)[keyof typeof PRODUCT_OPTIONS] | null {
  const normalized = text.trim().toLowerCase();

  if (normalized in PRODUCT_OPTIONS) {
    return PRODUCT_OPTIONS[normalized as keyof typeof PRODUCT_OPTIONS];
  }

  if (normalized.includes('gallon')) {
    return PRODUCT_OPTIONS['1'];
  }

  if (normalized.includes('pack')) {
    return PRODUCT_OPTIONS['2'];
  }

  if (normalized.includes('other') || normalized.includes('otro')) {
    return PRODUCT_OPTIONS['3'];
  }

  return null;
}

export function parseQuantity(text: string): number | null {
  const match = text.trim().match(/\d+/);

  if (!match) {
    return null;
  }

  const quantity = parseInt(match[0], 10);

  if (Number.isNaN(quantity) || quantity <= 0) {
    return null;
  }

  return quantity;
}
