/* =====================================================================
   NASTAVENÍ FORMULÁŘE – UPRAVTE
   ---------------------------------------------------------------------
   Přihlášky se ukládají do Google tabulky přes Google Apps Script.
   Postup nastavení je v souboru NAVOD-GOOGLE-TABULKY.md.
   Sem vložte adresu webové aplikace (končí na /exec).
   ===================================================================== */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyppeSSbkUIYw2ouQdHnhjifaRa45CTwq9RVNMiPiznEImGiLICPjwlFgQYyEErVFHn/exec";

/* ---------- Hvězdná obloha (canvas) ---------- */
(() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [], shooting = null, w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    const count = Math.floor((window.innerWidth * window.innerHeight) / 2600);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() ** 2 * 1.4 + 0.3) * dpr,
      a: Math.random() * 0.6 + 0.3,
      tw: Math.random() * 0.02 + 0.004,
      ph: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.15 ? "255,220,170" : Math.random() < 0.2 ? "180,200,255" : "255,255,255",
    }));
  }

  function spawnShootingStar() {
    shooting = {
      x: Math.random() * w * 0.7 + w * 0.2,
      y: Math.random() * h * 0.35,
      vx: -(6 + Math.random() * 4) * dpr,
      vy: (2.5 + Math.random() * 2) * dpr,
      life: 1,
    };
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const alpha = reduceMotion ? s.a : s.a * (0.65 + 0.35 * Math.sin(t * s.tw * 0.06 + s.ph));
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.hue},${alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) {
      if (!shooting && Math.random() < 0.004) spawnShootingStar();
      if (shooting) {
        const s = shooting;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        grad.addColorStop(0, `rgba(255,240,210,${s.life})`);
        grad.addColorStop(1, "rgba(255,240,210,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6 * dpr;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
        ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= 0.012;
        if (s.life <= 0) shooting = null;
      }
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener("resize", () => { resize(); if (reduceMotion) draw(0); });
  requestAnimationFrame(draw);
})();

/* ---------- Odpočet ---------- */
(() => {
  const el = document.getElementById("countdown");
  const start = new Date(el.dataset.start);
  const parts = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs"),
  };
  function tick() {
    const diff = start - new Date();
    if (isNaN(diff)) return;
    if (diff <= 0) {
      el.classList.add("done");
      el.textContent = diff > -4 * 3600e3 ? "Právě pozorujeme!" : "Akce již proběhla – děkujeme všem!";
      return;
    }
    parts.d.textContent = Math.floor(diff / 864e5);
    parts.h.textContent = String(Math.floor((diff / 36e5) % 24)).padStart(2, "0");
    parts.m.textContent = String(Math.floor((diff / 6e4) % 60)).padStart(2, "0");
    parts.s.textContent = String(Math.floor((diff / 1e3) % 60)).padStart(2, "0");
    setTimeout(tick, 1000);
  }
  tick();
})();

/* ---------- Postupné zobrazení sekcí ---------- */
(() => {
  const items = document.querySelectorAll(".section-head, .section-intro, .card, .object, .timeline");
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  items.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
})();

/* ---------- Formulář zájmu ---------- */
(() => {
  const form = document.getElementById("interest-form");
  const errorBox = document.getElementById("form-error");
  const success = document.getElementById("form-success");

  function validate() {
    let ok = true;
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    for (const input of form.querySelectorAll("[required]")) {
      if (!input.checkValidity()) {
        ok = false;
        input.classList.add("invalid");
      }
    }
    return ok;
  }

  function collect() {
    const fd = new FormData(form);
    return {
      jmeno: fd.get("jmeno"),
      email: fd.get("email"),
      trida: fd.get("trida") || "—",
      pocet: fd.get("pocet"),
      poznamka: fd.get("poznamka") || "—",
    };
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    if (!validate()) {
      errorBox.textContent = "Vyplňte prosím povinná pole označená hvězdičkou.";
      errorBox.hidden = false;
      return;
    }
    if (!GOOGLE_SCRIPT_URL) {
      errorBox.textContent = "Přihlašování zatím není spuštěné. Zkuste to prosím později.";
      errorBox.hidden = false;
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Odesílám…";
    try {
      // Google Apps Script nepovoluje CORS, proto režim "no-cors":
      // odpověď nelze přečíst, ale data se do tabulky zapíší. Odpověď od Googlu
      // chodí pomalu, proto na ni nečekáme déle než chvíli: když požadavek
      // neselže hned (např. kvůli chybějícímu připojení), ukážeme poděkování
      // a odeslání dobíhá na pozadí (keepalive).
      const request = fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        body: new URLSearchParams(collect()),
      });
      await Promise.race([
        request,
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
      showSuccess();
    } catch {
      errorBox.textContent = "Odeslání se nepodařilo (server neodpověděl). Zkuste to prosím znovu za chvíli.";
      errorBox.hidden = false;
      btn.disabled = false;
      btn.textContent = "Odeslat přihlášku";
    }
  });
})();
