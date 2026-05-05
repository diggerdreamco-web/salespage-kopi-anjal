// =====================================================
// GOOGLE APPS SCRIPT — Multi-Product Order Tracker
// =====================================================
//
// SETUP:
//
// 1. Buka Google Sheet — copy SHEET_ID dari URL
//    (URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit)
//
// 2. Update SHEET_ID constant bawah dgn ID sheet anda
//
// 3. Pada Row 1 (header), tulis:
//    A1: Tarikh        J1: Pakej
//    B1: Nama          K1: Harga (RM)
//    C1: Email         L1: Harga Asal
//    D1: Telefon       M1: Kod Voucher
//    E1: Alamat        N1: Diskaun (RM)
//    F1: Bandar        O1: Shipping (RM)
//    G1: Negeri        P1: Bill Code
//    H1: Poskod        Q1: Kaedah Bayar
//    I1: Produk        R1: Status
//
// 4. Extensions > Apps Script — paste code ni
//
// 5. Deploy > New Deployment > Web App
//    - Execute as: Me
//    - Who has access: Anyone
//    - Klik Deploy
//
// 6. Copy URL → letak dlm Cloudflare env var GOOGLE_SHEET_WEBHOOK
//
// =====================================================

const SHEET_ID = '1QTIkZZlvsjO8fC3LhX28DeGB5Iz-n8VLBnf9rzMaPg8';

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Callback dari ToyyibPay — update status je
    if (data.updateOnly && data.billCode) {
      var range = sheet.getDataRange();
      var values = range.getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][15] === data.billCode) { // Column P = Bill Code (index 15)
          sheet.getRange(i + 1, 18).setValue(data.status); // Column R = Status (col 18)
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
      data.product || "Anjal'e",         // I: Produk (NEW)
      data.package,                       // J: Pakej
      data.price,                         // K: Harga
      data.originalPrice || data.price,   // L: Harga Asal
      data.voucherCode || '',             // M: Kod Voucher
      data.discountAmount || 0,           // N: Diskaun
      data.shipping || 0,                 // O: Shipping
      data.billCode || '-',               // P: Bill Code
      data.paymentMethod || 'FPX',        // Q: Kaedah Bayar
      data.status || 'Pending'            // R: Status
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

// Helper — test deployment
function testConnection() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getActiveSheet();
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Total rows: ' + sheet.getLastRow());
  Logger.log('Total columns: ' + sheet.getLastColumn());
}
