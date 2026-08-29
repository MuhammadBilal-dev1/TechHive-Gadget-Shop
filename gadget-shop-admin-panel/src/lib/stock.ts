/**
 * Drop this file at: gadget-shop-admin-panel/src/lib/stock.ts
 *
 * Mirrors react-native-gadget-shop/src/theme/tokens.ts so both apps
 * agree on what counts as low/out of stock.
 */
export type StockStatus = "inStock" | "lowStock" | "outOfStock";

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return "outOfStock";
  if (quantity <= 5) return "lowStock";
  return "inStock";
}

export const stockStatusLabel: Record<StockStatus, string> = {
  inStock: "IN STOCK",
  lowStock: "LOW STOCK",
  outOfStock: "OUT OF STOCK",
};

export const stockStatusDotClass: Record<StockStatus, string> = {
  inStock: "spec-dot--in-stock",
  lowStock: "spec-dot--low-stock",
  outOfStock: "spec-dot--out-of-stock",
};