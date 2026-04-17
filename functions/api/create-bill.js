// ToyyibPay - Create Bill API
// Cloudflare Pages Function
//
// Environment variables required (set in Cloudflare Dashboard > Pages > Settings > Environment Variables):
//   TOYYIBPAY_SECRET_KEY    - Your ToyyibPay secret key
//   TOYYIBPAY_CATEGORY_CODE - Your ToyyibPay category code
//   TOYYIBPAY_SANDBOX       - Set "true" untuk sandbox testing, kosong/false untuk production
//   SITE_URL                - Your site URL (e.g. https://teratakniaga.com)
//   GOOGLE_SHEET_WEBHOOK    - Google Apps Script web app URL

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { name, email, phone, package: pkg, price } = body;

    if (!name || !email || !phone || !pkg || !price) {
      return new Response(
        JSON.stringify({ error: 'Sila isi semua maklumat yang diperlukan.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const packageNames = {
      starter: 'Kopi Anjal - Starter (1 Kotak)',
      bestvalue: 'Kopi Anjal - Best Value (3 Kotak)',
      hardcore: 'Kopi Anjal - Full Glow (5 Kotak)',
    };

    const billName = packageNames[pkg] || 'Kopi Anjal';
    const billAmount = price * 100;
    const siteUrl = env.SITE_URL || 'https://teratakniaga.com';

    // Toggle sandbox/production
    const isSandbox = env.TOYYIBPAY_SANDBOX === 'true';
    const toyyibBaseUrl = isSandbox
      ? 'https://dev.toyyibpay.com'
      : 'https://toyyibpay.com';

    const formData = new URLSearchParams();
    formData.append('userSecretKey', env.TOYYIBPAY_SECRET_KEY);
    formData.append('categoryCode', env.TOYYIBPAY_CATEGORY_CODE);
    formData.append('billName', billName);
    formData.append('billDescription', `Pembelian ${billName}`);
    formData.append('billPriceSetting', 1);
    formData.append('billPayorInfo', 1);
    formData.append('billAmount', billAmount.toString());
    formData.append('billReturnUrl', `${siteUrl}/success.html`);
    formData.append('billCallbackUrl', `${siteUrl}/api/callback`);
    formData.append('billExternalReferenceNo', `KA-${Date.now()}`);
    formData.append('billTo', name);
    formData.append('billEmail', email);
    formData.append('billPhone', phone);
    formData.append('billPaymentChannel', 2);

    const response = await fetch(`${toyyibBaseUrl}/index.php/api/createBill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result && result[0] && result[0].BillCode) {
      if (env.GOOGLE_SHEET_WEBHOOK) {
        fetch(env.GOOGLE_SHEET_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            address: body.address,
            city: body.city,
            state: body.state,
            postcode: body.postcode,
            package: billName,
            price,
            billCode: result[0].BillCode,
            status: 'Pending',
          }),
        }).catch(() => {});
      }

      return new Response(
        JSON.stringify({
          billCode: result[0].BillCode,
          paymentUrl: `${toyyibBaseUrl}/${result[0].BillCode}`,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Gagal mencipta bil. Sila cuba lagi.', details: result }),
      { status: 500, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server error. Sila cuba lagi.', message: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}