export const products = {
  tier1: {
    priceId: 'price_1QkSUIQOEfMvLB8ZyHhksdu0',
    name: 'Tier 1',
    description: 'Basic tier with essential features',
    mode: 'subscription' as const,
  },
  tier2: {
    priceId: 'price_1RSOH4QOEfMvLB8ZJpNBoPe0',
    name: 'Tier 2',
    description: 'Premium tier with advanced features',
    mode: 'subscription' as const,
  },
} as const;

export type Product = typeof products[keyof typeof products];
export type ProductId = keyof typeof products;