// Manual Order (QR / Bank Transfer) - Save to Google Sheets
// Cloudflare Pages Function
//
// Environment variables:
//   GOOGLE_SHEET_WEBHOOK - Google Apps Script web app URL

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
      starter: "Anjal'e Starter 1 Kotak (12s)",
      bestvalue: "Anjal'e Best Value 3 Kotak",
      hardcore: "Anjal'e Full Glow 5 Kotak",
    };

    const billName = packageNames[pkg] || "Anjal'e";
    const orderRef = `KA-${Date.now()}`;

    // Save to Google Sheets with status "Pending Bank Transfer"
    if (env.GOOGLE_SHEET_WEBHOOK) {
      try {
        await fetch(env.GOOGLE_SHEET_WEBHOOK, {
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
            originalPrice: body.originalPrice || price,
            voucherCode: body.voucherCode || '',
            discountAmount: body.discountAmount || 0,
            billCode: orderRef,
            status: 'Pending Bank Transfer',
            paymentMethod: 'QR / Bank Transfer',
          }),
        });
      } catch (e) {
        // Don't fail the order if Sheets is down — still return ref
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderRef,
        packageName: billName,
      }),
      { status: 200, headers: corsHeaders }
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
