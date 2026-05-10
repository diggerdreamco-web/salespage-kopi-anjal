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
      single: 'Kasturi Kijang 10ml',
    },
  },
  'kapsul-abe-janji': {
    name: 'Kapsul Abe Janji',
    packages: {
      single: 'Kapsul Abe Janji 1 Botol',
    },
  },
  'kapsul-kimanis': {
    name: 'Kapsul KiManis',
    packages: {
      single: 'Kapsul KiManis 1 Botol (20s)',
    },
  },
  'lsum-pypt': {
    name: 'LSUM PYPT',
    packages: {
      single: 'LSUM PYPT 80gm',
    },
  },
  'minyak-sauna': {
    name: 'Minyak Sauna',
    packages: {
      single: 'Minyak Sauna 1 Botol',
    },
  },
  'minyak-terapi-saraf': {
    name: 'Minyak Terapi Saraf',
    packages: {
      single: 'Minyak Terapi Saraf 1 Botol',
    },
  },
  'minyak-urut': {
    name: 'Minyak Urut',
    packages: {
      single: 'Minyak Urut 1 Botol',
    },
  },
  'sabun-kasturi-kijang': {
    name: 'Sabun Kasturi Kijang',
    packages: {
      single: 'Sabun Kasturi Kijang 1 Pcs',
    },
  },
  'ubat-gatal': {
    name: 'Ubat Gatal',
    packages: {
      single: 'Ubat Gatal 1 Pek',
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
