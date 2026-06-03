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

// Password untuk admin dashboard disimpan dlm Script Properties (encrypted)
// SETUP SEKALI SAHAJA:
//   1. Apps Script Editor → Project Settings (icon gear) → Script Properties
//   2. Add Property: name = ADMIN_SECRET, value = <password-anda>
//   3. Save
// Untuk tukar password kemudian, ubah dlm Script Properties — tak perlu redeploy.

function getAdminSecret() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET');
}

// GET — return orders untuk dashboard
// URL: <apps-script-url>?secret=YOUR_SECRET
function doGet(e) {
  try {
    var secret = e.parameter.secret;
    var adminSecret = getAdminSecret();
    if (!adminSecret) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'ADMIN_SECRET not set in Script Properties' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (secret !== adminSecret) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getActiveSheet();
    var range = sheet.getDataRange();
    var values = range.getValues();

    if (values.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', orders: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var orders = [];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      orders.push({
        tarikh: row[0],
        nama: row[1],
        email: row[2],
        telefon: row[3],
        alamat: row[4],
        bandar: row[5],
        negeri: row[6],
        poskod: row[7],
        produk: row[8],
        pakej: row[9],
        harga: Number(row[10]) || 0,
        hargaAsal: Number(row[11]) || 0,
        voucher: row[12],
        diskaun: Number(row[13]) || 0,
        shipping: Number(row[14]) || 0,
        billCode: row[15],
        kaedah: row[16],
        status: row[17] || 'Pending'
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', orders: orders.reverse() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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
