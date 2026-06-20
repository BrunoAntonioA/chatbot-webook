export type ProductKey = 'water_gallon' | 'water_pack' | 'other';

export interface ProductCatalogEntry {
  dbName: string;
  unitPrice: number;
}

export const PRODUCT_CATALOG: Record<ProductKey, ProductCatalogEntry> = {
  water_gallon: { dbName: 'Agua 20L', unitPrice: 800 },
  water_pack: { dbName: 'Pack Agua', unitPrice: 600 },
  other: { dbName: 'Otro', unitPrice: 0 },
};

export function resolveProductCatalogEntry(
  productKey?: string,
  productLabel?: string,
): ProductCatalogEntry {
  if (productKey && productKey in PRODUCT_CATALOG) {
    return PRODUCT_CATALOG[productKey as ProductKey];
  }

  return {
    dbName: productLabel ?? 'Otro',
    unitPrice: 0,
  };
}
