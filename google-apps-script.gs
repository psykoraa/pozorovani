/**
 * Ukládání přihlášek z webu do Google tabulky.
 *
 * Vložte celý tento kód do Rozšíření → Apps Script v Google tabulce,
 * kam se mají přihlášky ukládat, a nasaďte ho jako webovou aplikaci
 * (postup je v souboru NAVOD-GOOGLE-TABULKY.md).
 */

const SHEET_NAME = "Přihlášky";

// Vyplňte jen tehdy, když skript NENÍ vytvořený přes Rozšíření → Apps Script
// přímo v tabulce. ID je část adresy tabulky mezi /d/ a /edit.
const SPREADSHEET_ID = "";

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
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput("CHYBA: " + err.message);
  } finally {
    lock.releaseLock();
  }
}

// Kontrola v prohlížeči: otevřete adresu /exec. Ukáže, zda se skript dostane do tabulky.
function doGet() {
  try {
    const sheet = getSheet_();
    return ContentService.createTextOutput(
      "Funguje – tabulka „" + sheet.getParent().getName() + "“, list „" + SHEET_NAME +
      "“, uložených přihlášek: " + Math.max(sheet.getLastRow() - 1, 0)
    );
  } catch (err) {
    return ContentService.createTextOutput("CHYBA: " + err.message);
  }
}

function getSheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      "Skript není propojený s tabulkou. Vytvořte ho přes Rozšíření → Apps Script " +
      "v tabulce, nebo vyplňte SPREADSHEET_ID."
    );
  }
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
