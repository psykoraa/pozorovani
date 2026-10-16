# Napojení formuláře na Google Tabulky

Přihlášky z webu se budou automaticky ukládat jako nové řádky do Google tabulky.
Nastavení zabere asi 5 minut a dělá se jen jednou.

## 1. Vytvořte tabulku

1. Otevřete <https://sheets.new> (vytvoří se nová Google tabulka).
2. Pojmenujte ji, např. **Pozorování oblohy – přihlášky**.

## 2. Vložte skript

1. V tabulce klikněte na **Rozšíření → Apps Script**.
2. Smažte vše v souboru `Kód.gs` a vložte celý obsah souboru
   [`google-apps-script.gs`](google-apps-script.gs) z tohoto repozitáře.
3. Uložte (ikona diskety nebo Ctrl+S).

## 3. Nasaďte jako webovou aplikaci

1. Vpravo nahoře klikněte na **Nasadit → Nové nasazení**.
2. U „Vyberte typ“ (ozubené kolečko) zvolte **Webová aplikace**.
3. Nastavte:
   - **Spustit jako:** Já (váš účet)
   - **Kdo má přístup:** Kdokoli
4. Klikněte na **Nasadit** a povolte přístup ke svému účtu
   (u hlášky „Google tuto aplikaci neověřil“ zvolte *Rozšířené → Přejít na … (nebezpečné)* –
   jde o váš vlastní skript).
5. Zkopírujte **URL webové aplikace** – končí na `/exec`.

## 4. Vložte adresu do webu

V souboru `script.js` na začátku vyplňte:

```js
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/……/exec";
```

Uložte a nahrajte na GitHub. Hotovo – po odeslání formuláře se v tabulce
objeví list **Přihlášky** se sloupci *Čas přihlášení, Jméno a příjmení, E-mail,
Třída, Počet osob, Poznámka*.

## Tipy

- **Kontrola:** otevřete URL `/exec` v prohlížeči – má se zobrazit „Funguje – tabulka …,
  uložených přihlášek: …“. Pokud se zobrazí „CHYBA: …“, hláška říká, co je špatně.
- **Skript vytvořený mimo tabulku** (přímo na script.google.com): vyplňte v něm
  `SPREADSHEET_ID` – je to část adresy tabulky mezi `/d/` a `/edit`.
- **Upozornění e-mailem na novou přihlášku:** v tabulce *Nástroje → Pravidla upozornění*.
- **Úprava skriptu později:** po změně kódu je potřeba *Nasadit → Spravovat nasazení →
  upravit (tužka) → Verze: Nová verze → Nasadit*. Adresa `/exec` zůstane stejná.
