# Tambah Produk Baru — Quick Guide

Site sekarang multi-product. Setiap produk ada page sendiri dgn checkout/payment flow yg sama.

## Struktur

```
/                           → Catalog homepage (list semua produk)
/anjal-e                    → Anjal'e sales page
/produk-baru                → (Tambah dgn ikut langkah bawah)

style.css                   → Shared theme (semua page)
script.js                   → Shared checkout/voucher logic
catalog.css                 → Style khas catalog page
success.html                → Shared payment status page
images/                     → Shared image folder

functions/api/
  _products.js              → Product registry (server-side)
  create-bill.js            → ToyyibPay create bill
  manual-order.js           → QR/Bank order
  callback.js               → Payment status webhook
```

## Langkah Tambah Produk Baru

### 1. Buat folder produk
```
mkdir produk-baru
cp anjal-e/index.html produk-baru/index.html
```

### 2. Edit `produk-baru/index.html`
Cari & ganti:
- `<title>` — title produk baru
- `<meta name="description">` — description SEO
- `window.PRODUCT_CONFIG` — id, name, category produk:
  ```html
  <script>
    window.PRODUCT_CONFIG = {
      id: 'produk-baru',          // MUST match folder name
      name: 'Produk Baru',
      category: 'Kategori Produk'
    };
  </script>
  ```
- Logo `<a href="/" class="logo">PRODUK BARU</a>`
- Hero text (h1, sub, tag)
- Pricing cards `data-package`, `data-price`, `data-shipping`
- Product images (`/images/...`)
- Semua copy/content lain

### 3. Daftar produk dlm `functions/api/_products.js`
```js
export const PRODUCTS = {
  'anjal-e': { ... },

  'produk-baru': {
    name: 'Produk Baru',
    packages: {
      starter: 'Produk Baru Starter',     // Max 30 chars (ToyyibPay limit)
      bestvalue: 'Produk Baru Best Value',
      hardcore: 'Produk Baru Premium',
    },
  },
};
```

### 4. Tambah card dlm catalog `index.html`
```html
<a href="/produk-baru" class="catalog-card reveal">
  <div class="catalog-card-img">
    <img src="/images/produk-baru.png" alt="Produk Baru">
  </div>
  <div class="catalog-card-body">
    <span class="catalog-card-tag">Kategori</span>
    <h3>Produk Baru</h3>
    <p>Description ringkas...</p>
    <div class="catalog-card-meta">
      <span class="catalog-price">Dari RM50</span>
      <span class="catalog-cta">Lihat Detail →</span>
    </div>
  </div>
</a>
```

### 5. Update Google Sheet (manual)
Tambah produk dlm column "Produk" — Apps Script dah handle field ni automatically.
Pastikan column header `Produk` ada (column J atau mana-mana).

### 6. Test
- `git push` → tunggu Cloudflare deploy
- Buka `/produk-baru` — verify hero, package, checkout
- Test order dgn FPX 1¢ (sandbox dulu kalau perlu)
- Check Google Sheet — order patut muncul dgn nama produk betul

## Notes

- **Package keys** (`starter`, `bestvalue`, `hardcore`) boleh diubah, tapi pastikan match antara HTML `data-package` dgn `_products.js` keys
- **billName ≤ 30 chars** — kalau lebih panjang, ToyyibPay 500 error
- **Voucher** — share antara semua produk (kod ANJAL10 valid utk semua). Kalau nak voucher khas per-produk, edit `script.js` VOUCHERS object
- **WhatsApp number** — shared dlm `script.js` `WA_NUMBER` constant
