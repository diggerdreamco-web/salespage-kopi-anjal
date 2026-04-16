// =====================================================
// GOOGLE APPS SCRIPT - Paste code ni dalam Google Apps Script
// =====================================================
//
// CARA SETUP:
//
// 1. Buka Google Sheets baru — namakan "Kopi Anjal Orders"
//
// 2. Pada Row 1 (header), tulis:
//    A1: Tarikh
//    B1: Nama
//    C1: Email
//    D1: Telefon
//    E1: Alamat
//    F1: Bandar
//    G1: Negeri
//    H1: Poskod
//    I1: Pakej
//    J1: Harga (RM)
//    K1: Bill Code
//    L1: Status
//
// 3. Pergi Extensions > Apps Script
//
// 4. Delete semua code default, paste code bawah ni
//
// 5. Klik Deploy > New Deployment
//    - Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone
//    - Klik Deploy
//
// 6. Copy URL yang keluar — tu yang anda letak dalam
//    Cloudflare environment variable GOOGLE_SHEET_WEBHOOK
//
// =====================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Kalau callback dari ToyyibPay — update status je
    if (data.updateOnly && data.billCode) {
      var range = sheet.getDataRange();
      var values = range.getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][10] === data.billCode) { // Column K = Bill Code
          sheet.getRange(i + 1, 12).setValue(data.status); // Column L = Status
          break;
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'updated' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Order baru — tambah row
    sheet.appendRow([
      new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
      data.name,
      data.email,
      data.phone,
      data.address,
      data.city,
      data.state,
      data.postcode,
      data.package,
      data.price,
      data.billCode || '-',
      data.status || 'Pending'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
