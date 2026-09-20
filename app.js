const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const state = { tab: "home", guide: null, pos: null, heading: null, hot: "ua" };
const HOTS = [
  { id: "ua", x: 51.4, y: 28.6, r: "alto", title: "Ucraina", text: "Hot zone. Guerra regionale ad alta intensita. Infrastrutture colpite, rischio ordigni inesplosi, corridoi umanitari instabili." },
  { id: "il", x: 54.1, y: 35.2, r: "alto", title: "Levante", text: "Israele, Gaza, Libano, Siria. Area densa, aiuti irregolari, civili in movimento." },
  { id: "ir", x: 58.6, y: 36.6, r: "alto", title: "Golfo / Iran", text: "Teatro 2026: Hormuz e fronti collegati. Traffico marittimo e carburante sotto stress." },
  { id: "ye", x: 56.4, y: 43.6, r: "alto", title: "Yemen / Mar Rosso", text: "Combattimenti interni e pressione sulle rotte. Porti e navigazione a rischio." },
  { id: "sd", x: 54.6, y: 42.4, r: "alto", title: "Sudan", text: "Tra le guerre piu letali e meno coperte. Carestia, assedi, sanita collassata." },
  { id: "sl", x: 48.6, y: 42.8, r: "medio", title: "Sahel", text: "Mali, Burkina, Niger. Insorgenza vasta, strade insicure, Stato assente in molte zone." },
  { id: "cd", x: 54.0, y: 51.8, r: "alto", title: "Est RDC", text: "Kivu e milizie. Sfollati, minerali, accesso umanitario fragile." },
  { id: "za", x: 53.5, y: 70.2, r: "medio", title: "Sudafrica / SIGINT", text: "Marcatore SIGINT ACTIVE sulla carta. Snapshot di situazione, non allarme in tempo reale." },
  { id: "mm", x: 73.0, y: 41.6, r: "alto", title: "Myanmar", text: "Guerra civile dal 2021. Giunta, etnici, confine instabile." },
  { id: "et", x: 56.5, y: 46.2, r: "medio", title: "Etiopia / Tigray", text: "Scontri ripresi dopo la tregua. Strade e aiuti a intermittenza." },
  { id: "af", x: 62.0, y: 34.8, r: "medio", title: "Afghanistan-Pakistan", text: "Scontri di confine e insorgenza. Valichi e zone tribali instabili." },
  { id: "ht", x: 27.2, y: 41.4, r: "medio", title: "Haiti", text: "Violenza armata urbana. Porti e aiuti soggetti a interruzione." },
  { id: "cn", x: 78.4, y: 34.2, r: "medio", title: "Asia orientale", text: "Attivita visibile sulla carta (Cina / Pacifico ovest). Non e un ordine di missione." }
];
function onlineChip() {
  const el = $("#net");
  if (!el) return;
  if (navigator.onLine) { el.textContent = "NET ON"; el.className = "chip ok"; }
  else { el.textContent = "NET OFF"; el.className = "chip off"; }
}
function showTab(tab) {
  state.tab = tab; state.guide = null;
  $$(".nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  render();
}
function openGuide(id) {
  state.guide = GUIDES.find((g) => g.id === id) || null;
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
    return '<button type="button" class="hot' + on + delay + '" data-hot="' + h.id + '" style="left:' + h.x + "%;top:" + h.y + '%" aria-label="' + h.title + '"><span></span></button>';
  }).join("");
  return '<div class="globe"><div class="globe-bg" role="img" aria-label="Mappa mondo"></div><div class="hots-layer">' + marks + "</div></div>";
}
function renderHome() {
  const hot = HOTS.find((h) => h.id === state.hot) || HOTS[0];
  return '<section class="hero-ops"><div class="ops-head"><div><div class="kicker">Command home</div><h1>Situazione mondo</h1></div><div class="small">SITREP · NON IN DIRETTA</div></div>' +
    mapSvg() +
    '<div class="legend"><span><i class="dot r"></i>alta intensita</span><span><i class="dot o"></i>conflitto attivo</span><span><i class="dot y"></i>selezionato</span></div>' +
    '<div class="brief"><h3>' + hot.title + " · " + hot.r.toUpperCase() + "</h3><p>" + hot.text + " Tocca un punto sulla carta. Non e un ordine di missione: se sei in zona, priorita = toglierti dal fuoco e farti trovare dai soccorsi civili.</p></div></section>" +
    '<div class="section-label">Priorita immediate</div><div class="grid">' +
    HOME_ACTIONS.map((a) => '<article class="card" data-open="' + a.id + '"><div class="lead">QRF</div><h3>' + a.title + "</h3><p>" + a.text + "</p></article>").join("") +
    '</div><div class="section-label">Manuale da campo</div><div class="grid">' +
    [["fuoco-zero","Fuoco senza kit","Arco, acciarino, lente"],["ripari-peggio","Ripari peggiori","Debris hut, trincea, hasty"],["sere","Protocollo campo","Vivo e trovabile"],["orientamento","Navigazione","Sole, stelle, GPS"]].map((x) =>
      '<article class="card" data-open="' + x[0] + '"><div class="lead">FM</div><h3>' + x[1] + "</h3><p>" + x[2] + "</p></article>"
    ).join("") +
    '</div><div class="section-label">Teatri civili</div><div class="list">' + GUIDES.filter((g) => g.cat === "scenario").map(row).join("") + "</div>";
}
function row(g) {
  return '<article class="row" data-open="' + g.id + '"><div class="ico-wrap">' + g.ico + "</div><div><h3>" + g.title + "</h3><p>" + badge(g.level, g.tag) + g.blurb + "</p></div></article>";
}
function renderGuide(g) {
  return '<button class="back" id="back">Indietro</button><h2>' + g.title + "</h2><p>" + badge(g.level, g.tag) + g.blurb + "</p>" + g.body +
    '<p class="small">Manuale di supporto. Non sostituisce 112, GeoResQ, un istruttore o un corso BLSD.</p>';
}
function renderGuideList(q) {
  q = q || "";
  const query = q.trim().toLowerCase();
  const list = GUIDES.filter((g) => !query || (g.title + g.blurb + g.tag).toLowerCase().includes(query));
  return '<input class="search" id="q" placeholder="Cerca nel manuale" value="' + q.replace(/"/g, """) + '"><div class="list">' + (list.map(row).join("") || "<p>Nessun risultato.</p>") + "</div>";
}
function renderTools() {
  const p = state.pos;
  const acc = p ? Math.round(p.coords.accuracy) : "\u2014";
  const lat = p ? p.coords.latitude.toFixed(6) : "in acquisizione";
  const lon = p ? p.coords.longitude.toFixed(6) : "in acquisizione";
  const alt = p && p.coords.altitude != null ? Math.round(p.coords.altitude) + " m" : "n/d";
  const deg = state.heading != null ? Math.round(state.heading) : null;
  return '<div class="panel"><div class="kicker">Fix satellitare</div><h2>Posizione</h2><p class="small">Il chip GPS non usa la rete. Serve cielo.</p><div class="coords" id="latlon">' + lat + ", " + lon + '</div><p>Quota ' + alt + " \u00b7 \u00b1" + acc + ' m</p><div class="actions"><button class="btn pri" id="geo">Aggiorna</button><button class="btn" id="copyPos">Copia</button><button class="btn" id="smsPos">SMS</button></div></div>' +
    '<div class="panel"><div class="kicker">Orientamento</div><h2>Bussola</h2><div class="compass"><div class="n-label">N</div><div class="needle" id="needle"></div></div><p class="small" id="headTxt">' + (deg == null ? "Attiva i sensori." : deg + "\u00b0") + '</p><div class="actions"><button class="btn" id="compassBtn">Attiva</button></div></div>' +
    '<div class="panel"><div class="kicker">Segnale</div><h2>Balise schermo</h2><p class="small">Tre lampi = disagio.</p><div class="actions"><button class="btn danger" id="sosFlash">Lampeggia</button><button class="btn" id="sosStop">Stop</button></div></div>';
}
function renderKits() {
  const checks = (key, items) => items.map((it, i) => {
    const id = "kit-" + key + "-" + i;
    const on = localStorage.getItem(id) === "1";
    return '<label class="check"><input type="checkbox" data-check="' + id + '" ' + (on ? "checked" : "") + "><span>" + it + "</span></label>";
  }).join("");
  return '<div class="panel"><h2>Kit tasca</h2>' + checks("tasca", KITS.tasca) + '</div><div class="panel"><h2>Uscita giorno</h2>' + checks("giorno", KITS.giorno) + '</div><div class="panel"><h2>Casa 72 h</h2>' + checks("casa", KITS.casa) + "</div>";
}
function renderMe() {
  const d = JSON.parse(localStorage.getItem("sv-me") || "{}");
  const v = (k) => d[k] || "";
  return '<div class="panel"><div class="kicker">Personale</div><h2>Scheda medica</h2><p class="small">Solo su questo telefono.</p>' +
    '<label>Nome</label><input type="text" id="m-nome" value="' + v("nome") + '">' +
    '<label>Allergie</label><input type="text" id="m-all" value="' + v("all") + '">' +
    '<label>Farmaci</label><textarea id="m-farm" rows="3">' + v("farm") + "</textarea>" +
    '<label>Gruppo</label><input type="text" id="m-sang" value="' + v("sang") + '">' +
    '<label>Contatto</label><input type="text" id="m-tel" value="' + v("tel") + '">' +
    '<label>Note</label><textarea id="m-note" rows="3">' + v("note") + "</textarea>" +
    '<div class="actions"><button class="btn pri" id="saveMe">Salva</button></div></div>' +
    '<div class="panel"><h2>Batteria</h2><p id="batt" class="small">Lettura se il browser la consente.</p></div>';
}
function render() {
  const root = $("#app");
  if (state.guide) {
    root.innerHTML = renderGuide(state.guide);
    $("#back").onclick = () => { state.guide = null; render(); };
    return;
  }
  if (state.tab === "home") root.innerHTML = renderHome();
  if (state.tab === "guide") root.innerHTML = renderGuideList();
  if (state.tab === "tools") root.innerHTML = renderTools();
  if (state.tab === "kit") root.innerHTML = renderKits();
  if (state.tab === "me") root.innerHTML = renderMe();
  $$("[data-open]").forEach((el) => { el.onclick = () => openGuide(el.dataset.open); });
  $$("[data-hot]").forEach((el) => { el.onclick = () => { state.hot = el.getAttribute("data-hot"); render(); }; });
  const q = $("#q");
  if (q) q.oninput = () => { $("#app").innerHTML = renderGuideList(q.value); bindGuideSearch(); };
  bindTools(); bindKits(); bindMe();
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
  const geo = $("#geo"); if (!geo) return;
  geo.onclick = requestGeo;
  $("#copyPos").onclick = () => {
    if (!state.pos) return alert("Nessun fix.");
    const t = state.pos.coords.latitude.toFixed(6) + ", " + state.pos.coords.longitude.toFixed(6);
    navigator.clipboard && navigator.clipboard.writeText(t).then(() => alert("Copiato.")).catch(() => prompt("Copia:", t));
  };
  $("#smsPos").onclick = () => {
    const d = JSON.parse(localStorage.getItem("sv-me") || "{}");
    const who = d.nome ? d.nome + " " : "";
    const t = state.pos ? "SOS " + who + "pos: " + state.pos.coords.latitude.toFixed(6) + ", " + state.pos.coords.longitude.toFixed(6) : "SOS " + who + "no fix GPS";
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
function applyNeedle(deg) { const n = $("#needle"); if (n) n.style.transform = "rotate(" + deg + "deg)"; }
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
  state.heading = h; applyNeedle(h);
  const t = $("#headTxt"); if (t) t.textContent = Math.round(h) + "\u00b0";
}
function bindKits() {
  $$("[data-check]").forEach((box) => { box.onchange = () => localStorage.setItem(box.dataset.check, box.checked ? "1" : "0"); });
}
function bindMe() {
  const btn = $("#saveMe"); if (!btn) return;
  btn.onclick = () => {
    localStorage.setItem("sv-me", JSON.stringify({
      nome: $("#m-nome").value, all: $("#m-all").value, farm: $("#m-farm").value,
      sang: $("#m-sang").value, tel: $("#m-tel").value, note: $("#m-note").value
    }));
    btn.textContent = "Salvato";
  };
  if (navigator.getBattery) navigator.getBattery().then((b) => {
    const el = $("#batt");
    if (el) el.textContent = "Batteria " + Math.round(b.level * 100) + "%" + (b.charging ? " in carica" : "");
  });
}
window.addEventListener("online", onlineChip);
window.addEventListener("offline", onlineChip);
$$(".nav button").forEach((b) => { b.onclick = () => showTab(b.dataset.tab); });
$("#sosTop").onclick = () => openGuide("112");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
onlineChip();
render();
requestGeo();
