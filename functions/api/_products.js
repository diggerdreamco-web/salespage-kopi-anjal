// Product Registry — Shared between create-bill, manual-order, callback
// File prefixed with _ so Cloudflare Pages won't expose as a route.
//
// To add a new product:
// 1. Add a new entry below with id matching window.PRODUCT_CONFIG.id on the page
// 2. Each package label MUST be ≤30 chars (ToyyibPay billName limit)
// 3. Default fallback is 'anjal-e' if product id missing/unknown

export const PRODUCTS = {
  'anjal-e': {
    name: "Anjal'e",
    packages: {
      starter: "Anjal'e Starter 1 Kotak (12s)",
      bestvalue: "Anjal'e Best Value 2 Kotak",
      hardcore: "Anjal'e Full Glow 3 Kotak",
    },
  },
  'kasturi-kijang': {
    name: 'Kasturi Kijang',
    packages: {
      single: 'Kasturi Kijang 1 Botol',
      bundle3: 'Kasturi Kijang 3 Botol',
      bundle5: 'Kasturi Kijang 5 Botol',
    },
  },
};

export function resolveBillName(productId, pkg) {
  const product = PRODUCTS[productId] || PRODUCTS['anjal-e'];
  return (product.packages && product.packages[pkg]) || product.name;
}

export function resolveProductName(productId) {
  const product = PRODUCTS[productId] || PRODUCTS['anjal-e'];
  return product.name;
}
