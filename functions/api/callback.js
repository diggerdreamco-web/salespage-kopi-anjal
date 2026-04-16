// ToyyibPay - Payment Callback Handler
// This endpoint receives payment status updates from ToyyibPay

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    const refNo = formData.get('refno');
    const status = formData.get('status');
    const reason = formData.get('reason');
    const billCode = formData.get('billcode');
    const orderId = formData.get('order_id');

    // Status: 1 = Success, 2 = Pending, 3 = Failed
    const statusText = status === '1' ? 'Berjaya' : status === '3' ? 'Gagal' : 'Pending';

    console.log('ToyyibPay Callback:', {
      refNo,
      status: statusText,
      reason,
      billCode,
      orderId,
    });

    // Update status dalam Google Sheets
    if (env.GOOGLE_SHEET_WEBHOOK) {
      await fetch(env.GOOGLE_SHEET_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billCode,
          status: statusText,
          updateOnly: true,
        }),
      }).catch(() => {});
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Callback error:', err.message);
    return new Response('Error', { status: 500 });
  }
}
