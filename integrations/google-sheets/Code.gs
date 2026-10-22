// Paste into Google Apps Script. Configure SPREADSHEET_ID and SYNC_TOKEN
// under Project Settings > Script Properties. Never put secrets in this file.
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var config = PropertiesService.getScriptProperties();
    var token = config.getProperty('SYNC_TOKEN');
    var spreadsheetId = config.getProperty('SPREADSHEET_ID');
    var body = JSON.parse(e.postData.contents);
    if (!token || !spreadsheetId || body.token !== token) return result_({ok: false});
    var order = body.order;
    if (!order || !order.requestId || !Array.isArray(order.items)) return result_({ok: false});
    lock.waitLock(20000);
    var book = SpreadsheetApp.openById(spreadsheetId);
    var sheet = book.getSheetByName('Commandes') || book.insertSheet('Commandes');
    var headers = ['Clé unique', 'Commande', 'Date', 'Client', 'Téléphone', 'Adresse', 'Produits', 'Quantités', 'Total DH', 'Statut'];
    if (sheet.getLastRow() === 0) { sheet.appendRow(headers); sheet.setFrozenRows(1); }
    var key = String(order.requestId);
    if (sheet.getLastRow() > 1) {
      var existing = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(key).matchEntireCell(true).useRegularExpression(false).findNext();
      if (existing) return result_({ok: true, duplicate: true});
    }
    var row = [key, order.id, order.created, order.customer, order.phone, order.address,
      order.items.map(function(i) { return i.name; }).join(' | '),
      order.items.map(function(i) { return i.quantity; }).join(' | '), order.total, order.status];
    // User text is stored as text, never as spreadsheet formulas.
    row = row.map(function(value) { return typeof value === 'string' && /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value; });
    var target = sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
    target.getCell(1, 5).setNumberFormat('@');
    target.setValues([row]);
    SpreadsheetApp.flush();
    return result_({ok: true});
  } catch (error) { return result_({ok: false}); }
  finally { if (lock.hasLock()) lock.releaseLock(); }
}
function result_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
