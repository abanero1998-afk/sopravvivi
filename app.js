const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const state = { tab: "home", guide: null, pos: null, heading: null, hot: "ua" };

const HOTS = [
  { id: "ua", x: 54.8, y: 32.2, r: "alto", title: "Ucraina", text: "Guerra regionale ad alta intensita. Infrastrutture colpite, rischio ordigni inesplosi, corridoi umanitari instabili." },
  { id: "il", x: 57.2, y: 38.6, r: "alto", title: "Levante", text: "Israele, Gaza, Libano, Siria. Area densa, aiuti irregolari, civili in movimento." },
  { id: "ir", x: 60.6, y: 39.4, r: "alto", title: "Golfo / Iran", text: "Teatro Hormuz e fronti collegati. Traffico marittimo e carburante sotto stress." },
  { id: "ye", x: 58.8, y: 45.8, r: "alto", title: "Yemen / Mar Rosso", text: "Combattimenti interni e pressione sulle rotte. Porti e navigazione a rischio." },
  { id: "sd", x: 56.6, y: 44.8, r: "alto", title: "Sudan", text: "Tra le guerre piu letali e meno coperte. Carestia, assedi, sanita collassata." },
  { id: "sl", x: 50.2, y: 44.6, r: "medio", title: "Sahel", text: "Mali, Burkina, Niger. Insorgenza vasta, strade insicure, Stato assente in molte zone." },
  { id: "cd", x: 55.4, y: 53.2, r: "alto", title: "Est RDC", text: "Kivu e milizie. Sfollati, minerali, accesso umanitario fragile." },
  { id: "za", x: 54.6, y: 72.4, r: "medio", title: "Africa australe", text: "Snapshot di situazione. Non e un allarme in tempo reale." },
  { id: "mm", x: 75.2, y: 44.0, r: "alto", title: "Myanmar", text: "Guerra civile dal 2021. Giunta, etnici, confine instabile." },
  { id: "et", x: 58.4, y: 48.6, r: "medio", title: "Etiopia / Tigray", text: "Scontri ripresi dopo la tregua. Strade e aiuti a intermittenza." },
  { id: "af", x: 64.8, y: 37.4, r: "medio", title: "Afghanistan-Pakistan", text: "Scontri di confine e insorgenza. Valichi e zone tribali instabili." },
  { id: "ht", x: 28.6, y: 42.8, r: "medio", title: "Haiti", text: "Violenza armata urbana. Porti e aiuti soggetti a interruzione." },
  { id: "cn", x: 80.6, y: 36.8, r: "medio", title: "Asia orientale", text: "Attivita visibile sulla carta (Pacifico ovest). Non e un ordine di missione." }
];

function escAttr(s) {
  return String(s || "").replace(/&/g, "&").replace(/"/g, """).replace(/</g, "<");
}

function onlineChip() {
  const el = $("#net");
  if (!el) return;
  if (navigator.onLine) {
    el.textContent = "NET ON";
    el.className = "chip ok";
  } else {
    el.textContent = "NET OFF";
    el.className = "chip off";
  }
}

function showTab(tab) {
  state.tab = tab;
  state.guide = null;
  $$(".nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  render();
}

function openGuide(id) {
  const list = typeof GUIDES !== "undefined" ? GUIDES : [];
  state.guide = list.find((g) => g.id === id) || null;
  render();
}

function badge(level, tag) {
  const cls = level === "crit" ? "crit" : level === "warn" ? "warn" : "info";
  return '<span class="badge ' + cls + '">' + tag + "</span>";
}

function mapSvg() {
  const marks = HOTS.map((h, i) => {
    const on = h.id === state.hot ? " on" : "";
    const delay = " d" + (i % 3);
    return (
      '<button type="button" class="hot' + on + delay +
      '" data-hot="' + h.id +
      '" style="left:' + h.x + "%;top:" + h.y +
      '%" aria-label="' + escAttr(h.title) + '"><span></span></button>'
    );
  }).join("");

  const land =
    "M 155 118 C 148 92 168 72 198 68 C 230 62 268 78 292 98 C 318 122 338 118 352 138 C 368 162 348 188 322 198 C 298 208 278 198 252 208 C 228 218 198 208 178 188 C 162 172 160 142 155 118 Z " +
    "M 198 228 C 208 218 232 222 248 238 C 262 254 248 268 228 272 C 210 276 192 256 198 228 Z " +
    "M 268 248 C 292 238 318 258 328 292 C 338 328 322 368 302 398 C 284 424 258 438 238 418 C 218 396 228 352 238 318 C 246 288 252 258 268 248 Z " +
    "M 438 92 C 458 78 492 82 512 98 C 528 112 522 132 508 142 C 492 152 468 148 452 136 C 438 124 428 104 438 92 Z " +
    "M 478 148 C 498 138 528 148 548 168 C 572 192 598 188 628 198 C 662 208 698 198 728 208 C 762 218 802 208 838 218 C 872 228 902 218 918 238 C 932 254 918 278 892 282 C 862 288 828 272 798 278 C 768 284 742 298 712 292 C 682 286 658 268 628 262 C 598 256 572 268 548 258 C 522 248 508 228 492 208 C 478 188 468 162 478 148 Z " +
    "M 498 268 C 528 248 568 258 588 292 C 608 328 598 368 578 402 C 558 436 528 458 508 438 C 488 418 492 378 498 348 C 504 318 488 288 498 268 Z " +
    "M 798 318 C 818 308 848 318 858 338 C 868 358 848 372 828 368 C 808 364 788 338 798 318 Z " +
    "M 168 318 C 188 308 208 322 198 342 C 188 358 158 352 168 318 Z";

  return (
    '<div class="globe">' +
      '<svg class="world" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="ocean" cx="50%" cy="45%" r="70%">' +
            '<stop offset="0%" stop-color="#102018"/>' +
            '<stop offset="100%" stop-color="#050806"/>' +
          '</radialGradient>' +
          '<linearGradient id="land" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#6e7d62"/>' +
            '<stop offset="100%" stop-color="#3d4a38"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect width="1000" height="500" fill="url(#ocean)"/>' +
        '<g stroke="rgba(196,165,116,.10)" stroke-width="0.6" fill="none">' +
          '<path d="M0 50h1000M0 100h1000M0 150h1000M0 200h1000M0 250h1000M0 300h1000M0 350h1000M0 400h1000M0 450h1000"/>' +
          '<path d="M100 0v500M200 0v500M300 0v500M400 0v500M500 0v500M600 0v500M700 0v500M800 0v500M900 0v500"/>' +
        '</g>' +
        '<path fill="url(#land)" stroke="#c4a574" stroke-width="0.7" stroke-opacity=".35" d="' + land + '"/>' +
      '</svg>' +
      '<div class="scan"></div>' +
      '<div class="cross"></div>' +
      '<div class="hots-layer">' + marks + "</div>" +
    "</div>"
  );
}

function renderHome() {
  const guides = typeof GUIDES !== "undefined" ? GUIDES : [];
  const actions = typeof HOME_ACTIONS !== "undefined" ? HOME_ACTIONS : [];
  const hot = HOTS.find((h) => h.id === state.hot) || HOTS[0];
  return (
    '<section class="hero-ops">' +
      '<div class="ops-head">' +
        "<div><div class=\"kicker\">Command home</div><h1>Situazione mondo</h1></div>" +
        '<div class="small">SITREP \u00b7 SNAPSHOT OFFLINE</div>' +
      "</div>" +
      mapSvg() +
      '<div class="legend">' +
        '<span><i class="dot r"></i>alta intensita</span>' +
        '<span><i class="dot o"></i>conflitto attivo</span>' +
        '<span><i class="dot y"></i>selezionato</span>' +
      "</div>" +
      '<div class="brief"><h3>' + hot.title + " \u00b7 " + hot.r.toUpperCase() + "</h3>" +
        "<p>" + hot.text + " Tocca un punto sulla carta. Non e un ordine di missione: se sei in zona, priorita = toglierti dal fuoco e farti trovare dai soccorsi civili.</p>" +
      "</div>" +
    "</section>" +
    '<div class="section-label">Priorita immediate</div><div class="grid">' +
      actions.map((a) =>
        '<article class="card" data-open="' + a.id + '"><div class="lead">QRF</div><h3>' + a.title + "</h3><p>" + a.text + "</p></article>"
      ).join("") +
    "</div>" +
    '<div class="section-label">Manuale da campo</div><div class="grid">' +
      [
        ["fuoco-zero", "Fuoco senza kit", "Arco, acciarino, lente"],
        ["ripari-peggio", "Ripari peggiori", "Debris hut, trincea, hasty"],
        ["sere", "Protocollo campo", "Vivo e trovabile"],
        ["orientamento", "Navigazione", "Sole, stelle, GPS"]
      ].map((x) =>
        '<article class="card" data-open="' + x[0] + '"><div class="lead">FM</div><h3>' + x[1] + "</h3><p>" + x[2] + "</p></article>"
      ).join("") +
    "</div>" +
    '<div class="section-label">Teatri civili</div><div class="list">' +
      guides.filter((g) => g.cat === "scenario").map(row).join("") +
    "</div>"
  );
}

function row(g) {
  return (
    '<article class="row" data-open="' + g.id + '">' +
      '<div class="ico-wrap">' + (g.ico || "") + "</div>" +
      "<div><h3>" + g.title + "</h3><p>" + badge(g.level, g.tag) + g.blurb + "</p></div>" +
    "</article>"
  );
}

function renderGuide(g) {
  return (
    '<button class="back" id="back" type="button">Indietro</button>' +
    "<h2>" + g.title + "</h2>" +
    "<p>" + badge(g.level, g.tag) + g.blurb + "</p>" +
    (g.body || "") +
    '<p class="small">Manuale di supporto. Non sostituisce 112, GeoResQ, un istruttore o un corso BLSD.</p>'
  );
}

function renderGuideList(q) {
  q = q || "";
  const query = q.trim().toLowerCase();
  const guides = typeof GUIDES !== "undefined" ? GUIDES : [];
  const list = guides.filter((g) => !query || (g.title + g.blurb + g.tag).toLowerCase().includes(query));
  return (
    '<input class="search" id="q" placeholder="Cerca nel manuale" value="' + escAttr(q) + '">' +
    '<div class="list">' + (list.map(row).join("") || "<p>Nessun risultato.</p>") + "</div>"
  );
}

function renderTools() {
  const p = state.pos;
  const acc = p ? Math.round(p.coords.accuracy) : "\u2014";
  const lat = p ? p.coords.latitude.toFixed(6) : "in acquisizione";
  const lon = p ? p.coords.longitude.toFixed(6) : "in acquisizione";
  const alt = p && p.coords.altitude != null ? Math.round(p.coords.altitude) + " m" : "n/d";
  const deg = state.heading != null ? Math.round(state.heading) : null;
  return (
    '<div class="panel"><div class="kicker">Fix satellitare</div><h2>Posizione</h2>' +
      '<p class="small">Il chip GPS non usa la rete. Serve cielo.</p>' +
      '<div class="coords" id="latlon">' + lat + ", " + lon + "</div>" +
      "<p>Quota " + alt + " \u00b7 \u00b1" + acc + " m</p>" +
      '<div class="actions">' +
        '<button class="btn pri" id="geo" type="button">Aggiorna</button>' +
        '<button class="btn" id="copyPos" type="button">Copia</button>' +
        '<button class="btn" id="smsPos" type="button">SMS</button>' +
      "</div></div>" +
    '<div class="panel"><div class="kicker">Orientamento</div><h2>Bussola</h2>' +
      '<div class="compass"><div class="n-label">N</div><div class="needle" id="needle"></div></div>' +
      '<p class="small" id="headTxt">' + (deg == null ? "Attiva i sensori." : deg + "\u00b0") + "</p>" +
      '<div class="actions"><button class="btn" id="compassBtn" type="button">Attiva</button></div></div>' +
    '<div class="panel"><div class="kicker">Segnale</div><h2>Balise schermo</h2>' +
      '<p class="small">Tre lampi = disagio.</p>' +
      '<div class="actions">' +
        '<button class="btn danger" id="sosFlash" type="button">Lampeggia</button>' +
        '<button class="btn" id="sosStop" type="button">Stop</button>' +
      "</div></div>"
  );
}

function renderKits() {
  const kits = typeof KITS !== "undefined" ? KITS : { tasca: [], giorno: [], casa: [] };
  const checks = (key, items) => (items || []).map((it, i) => {
    const id = "kit-" + key + "-" + i;
    const on = localStorage.getItem(id) === "1";
    return (
      '<label class="check"><input type="checkbox" data-check="' + id + '" ' +
      (on ? "checked" : "") + "><span>" + it + "</span></label>"
    );
  }).join("");
  return (
    '<div class="panel"><h2>Kit tasca</h2>' + checks("tasca", kits.tasca) + "</div>" +
    '<div class="panel"><h2>Uscita giorno</h2>' + checks("giorno", kits.giorno) + "</div>" +
    '<div class="panel"><h2>Casa 72 h</h2>' + checks("casa", kits.casa) + "</div>"
  );
}

function renderMe() {
  const d = JSON.parse(localStorage.getItem("sv-me") || "{}");
  const v = (k) => escAttr(d[k] || "");
  return (
    '<div class="panel"><div class="kicker">Personale</div><h2>Scheda medica</h2>' +
      '<p class="small">Solo su questo telefono.</p>' +
      '<label>Nome</label><input type="text" id="m-nome" value="' + v("nome") + '">' +
      '<label>Allergie</label><input type="text" id="m-all" value="' + v("all") + '">' +
      '<label>Farmaci</label><textarea id="m-farm" rows="3">' + (d.farm || "") + "</textarea>" +
      '<label>Gruppo</label><input type="text" id="m-sang" value="' + v("sang") + '">' +
      '<label>Contatto</label><input type="text" id="m-tel" value="' + v("tel") + '">' +
      '<label>Note</label><textarea id="m-note" rows="3">' + (d.note || "") + "</textarea>" +
      '<div class="actions"><button class="btn pri" id="saveMe" type="button">Salva</button></div></div>' +
    '<div class="panel"><h2>Batteria</h2><p id="batt" class="small">Lettura se il browser la consente.</p></div>'
  );
}

function render() {
  const root = $("#app");
  if (!root) return;
  try {
    if (state.guide) {
      root.innerHTML = renderGuide(state.guide);
      const back = $("#back");
      if (back) back.onclick = () => { state.guide = null; render(); };
      return;
    }
    if (state.tab === "home") root.innerHTML = renderHome();
    else if (state.tab === "guide") root.innerHTML = renderGuideList();
    else if (state.tab === "tools") root.innerHTML = renderTools();
    else if (state.tab === "kit") root.innerHTML = renderKits();
    else if (state.tab === "me") root.innerHTML = renderMe();
    $$("[data-open]").forEach((el) => { el.onclick = () => openGuide(el.dataset.open); });
    $$("[data-hot]").forEach((el) => {
      el.onclick = () => { state.hot = el.getAttribute("data-hot"); render(); };
    });
    const q = $("#q");
    if (q) q.oninput = () => { $("#app").innerHTML = renderGuideList(q.value); bindGuideSearch(); };
    bindTools();
    bindKits();
    bindMe();
  } catch (err) {
    root.innerHTML = '<div class="panel"><h2>Errore interfaccia</h2><p class="small">' + String(err.message || err) + "</p></div>";
  }
}

function bindGuideSearch() {
  $$("[data-open]").forEach((el) => { el.onclick = () => openGuide(el.dataset.open); });
  const q = $("#q");
  if (q) {
    q.focus();
    q.setSelectionRange(q.value.length, q.value.length);
    q.oninput = () => { $("#app").innerHTML = renderGuideList(q.value); bindGuideSearch(); };
  }
}

function bindTools() {
  const geo = $("#geo");
  if (!geo) return;
  geo.onclick = requestGeo;
  $("#copyPos").onclick = () => {
    if (!state.pos) return alert("Nessun fix.");
    const t = state.pos.coords.latitude.toFixed(6) + ", " + state.pos.coords.longitude.toFixed(6);
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => alert("Copiato.")).catch(() => prompt("Copia:", t));
    else prompt("Copia:", t);
  };
  $("#smsPos").onclick = () => {
    const d = JSON.parse(localStorage.getItem("sv-me") || "{}");
    const who = d.nome ? d.nome + " " : "";
    const t = state.pos
      ? "SOS " + who + "pos: " + state.pos.coords.latitude.toFixed(6) + ", " + state.pos.coords.longitude.toFixed(6)
      : "SOS " + who + "no fix GPS";
    location.href = "sms:?body=" + encodeURIComponent(t);
  };
  $("#compassBtn").onclick = enableCompass;
  if (state.heading != null) applyNeedle(state.heading);
  $("#sosFlash").onclick = () => document.body.classList.add("flash-sos");
  $("#sosStop").onclick = () => document.body.classList.remove("flash-sos");
}

function requestGeo() {
  if (!navigator.geolocation) return alert("GPS assente.");
  navigator.geolocation.getCurrentPosition(
    (pos) => { state.pos = pos; if (state.tab === "tools" && !state.guide) render(); },
    (err) => alert("GPS: " + err.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
  );
}

function applyNeedle(deg) {
  const n = $("#needle");
  if (n) n.style.transform = "rotate(" + deg + "deg)";
}

async function enableCompass() {
  try {
    if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== "granted") return alert("Sensori negati.");
    }
  } catch (e) {}
  window.addEventListener("deviceorientationabsolute", onOrient, true);
  window.addEventListener("deviceorientation", onOrient, true);
}

function onOrient(e) {
  let h = e.webkitCompassHeading;
  if (h == null && e.alpha != null) h = 360 - e.alpha;
  if (h == null) return;
  state.heading = h;
  applyNeedle(h);
  const t = $("#headTxt");
  if (t) t.textContent = Math.round(h) + "\u00b0";
}

function bindKits() {
  $$("[data-check]").forEach((box) => {
    box.onchange = () => localStorage.setItem(box.dataset.check, box.checked ? "1" : "0");
  });
}

function bindMe() {
  const btn = $("#saveMe");
  if (!btn) return;
  btn.onclick = () => {
    localStorage.setItem("sv-me", JSON.stringify({
      nome: $("#m-nome").value,
      all: $("#m-all").value,
      farm: $("#m-farm").value,
      sang: $("#m-sang").value,
      tel: $("#m-tel").value,
      note: $("#m-note").value
    }));
    btn.textContent = "Salvato";
  };
  if (navigator.getBattery) {
    navigator.getBattery().then((b) => {
      const el = $("#batt");
      if (el) el.textContent = "Batteria " + Math.round(b.level * 100) + "%" + (b.charging ? " in carica" : "");
    });
  }
}

window.addEventListener("online", onlineChip);
window.addEventListener("offline", onlineChip);
$$(".nav button").forEach((b) => { b.onclick = () => showTab(b.dataset.tab); });
const sos = $("#sosTop");
if (sos) sos.onclick = () => openGuide("112");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
onlineChip();
render();
requestGeo();
