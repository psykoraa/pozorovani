/**
 * Ukládání přihlášek z webu do Google tabulky.
 *
 * Vložte celý tento kód do Rozšíření → Apps Script v Google tabulce,
 * kam se mají přihlášky ukládat, a nasaďte ho jako webovou aplikaci
 * (postup je v souboru NAVOD-GOOGLE-TABULKY.md).
 */

const SHEET_NAME = "Přihlášky";
const COLUMNS = [
  ["cas", "Čas přihlášení"],
  ["jmeno", "Jméno a příjmení"],
  ["email", "E-mail"],
  ["trida", "Třída"],
  ["pocet", "Počet osob"],
  ["poznamka", "Poznámka"],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const p = e.parameter || {};
    const row = COLUMNS.map(([key]) =>
      key === "cas" ? new Date() : clean_(p[key])
    );
    sheet.appendRow(row);
    return ContentService.createTextOutput("OK");
  } finally {
    lock.releaseLock();
  }
}

// Kontrola v prohlížeči: otevřete adresu /exec a mělo by se zobrazit „Funguje“.
function doGet() {
  return ContentService.createTextOutput("Funguje – přihlášky se ukládají do listu „" + SHEET_NAME + "“.");
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([, title]) => title));
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Ořízne délku a zabrání tomu, aby se text začínající "=" choval jako vzorec.
function clean_(value) {
  let s = String(value == null ? "" : value).trim().slice(0, 1000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
