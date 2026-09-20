const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const state = {
  tab: "home",
  guide: null,
  watchId: null,
  pos: null,
  heading: null
};

function onlineChip() {
  const el = $("#net");
  if (!el) return;
  if (navigator.onLine) {
    el.textContent = "rete ok";
    el.className = "chip ok";
  } else {
    el.textContent = "offline";
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
  state.guide = GUIDES.find((g) => g.id === id) || null;
  render();
}

function badge(level, tag) {
  const cls = level === "crit" ? "crit" : level === "warn" ? "warn" : "info";
  return '<span class="badge ' + cls + '">' + tag + '</span>';
}

function renderGuide(g) {
  return '<button class="back" id="back">\u2190 Tutte le guide</button>' +
    '<h2>' + g.ico + ' ' + g.title + '</h2>' +
    '<p>' + badge(g.level, g.tag) + ' ' + g.blurb + '</p>' +
    g.body +
    '<p class="small">Non sostituisce un corso di primo soccorso, il 112 o GeoResQ. In dubbio, chiama i soccorsi.</p>';
}

function renderHome() {
  return '<section class="hero"><h1>Tutto qui. Anche senza Internet.</h1>' +
    '<p>Guide di sopravvivenza e primo soccorso salvate sul telefono. Installa l\'app una volta, poi funziona senza campo.</p>' +
    '<div class="actions"><button class="btn pri" id="installHint">Come installarla</button>' +
    '<button class="btn" data-open="112">Numeri di emergenza</button></div></section>' +
    '<h2>In questo momento</h2><div class="grid" style="margin:.6rem 0 1rem">' +
    HOME_ACTIONS.map((a) => '<article class="card" data-open="' + a.id + '"><span class="ico">' + a.ico +
    '</span><h3>' + a.title + '</h3><p>' + a.text + '</p></article>').join('') +
    '</div><h2>Scenari</h2><div class="list" style="margin-top:.55rem">' +
    GUIDES.filter((g) => g.cat === 'scenario').map(row).join('') + '</div>';
}

function row(g) {
  return '<article class="row" data-open="' + g.id + '"><div class="ico">' + g.ico +
    '</div><div><h3>' + g.title + '</h3><p>' + badge(g.level, g.tag) + g.blurb + '</p></div></article>';
}

function renderGuideList(q) {
  q = q || '';
  const query = q.trim().toLowerCase();
  const list = GUIDES.filter((g) => !query || (g.title + g.blurb + g.tag).toLowerCase().includes(query));
  return '<input class="search" id="q" placeholder="Cerca: sangue, vipera, acqua, terremoto\u2026" value="' +
    q.replace(/"/g, '"') + '"><div class="list">' +
    (list.map(row).join('') || '<p>Nessun risultato.</p>') + '</div>';
}

function renderTools() {
  const p = state.pos;
  const acc = p ? Math.round(p.coords.accuracy) : '\u2014';
  const lat = p ? p.coords.latitude.toFixed(6) : 'in attesa\u2026';
  const lon = p ? p.coords.longitude.toFixed(6) : 'in attesa\u2026';
  const alt = p && p.coords.altitude != null ? Math.round(p.coords.altitude) + ' m' : 'n/d';
  const deg = state.heading != null ? Math.round(state.heading) : null;
  return '<div class="tool-grid"><section class="panel"><h2>Posizione GPS</h2>' +
    '<p class="small">Il GPS usa i satelliti, non la rete. All\'aperto arriva.</p>' +
    '<div class="coords" id="latlon">' + lat + ', ' + lon + '</div>' +
    '<p>Quota ' + alt + ' \u00b7 precisione \u00b1' + acc + ' m</p>' +
    '<div class="actions"><button class="btn pri" id="geo">Aggiorna posizione</button>' +
    '<button class="btn" id="copyPos">Copia coordinate</button>' +
    '<button class="btn" id="smsPos">Prepara SMS</button></div></section>' +
    '<section class="panel"><h2>Bussola</h2>' +
    '<div class="compass"><div class="n-label">N</div><div class="needle" id="needle"></div></div>' +
    '<p class="small" id="headTxt">' + (deg == null ? 'Tieni il telefono in piano. Su iPhone concedi i sensori.' : deg + '\u00b0 dal nord magnetico') + '</p>' +
    '<div class="actions"><button class="btn" id="compassBtn">Attiva bussola</button></div></section>' +
    '<section class="panel"><h2>Segnale SOS</h2>' +
    '<p class="small">Usa lo schermo se la torcia non e\' disponibile dal browser.</p>' +
    '<div class="actions"><button class="btn danger" id="sosFlash">Lampeggia schermo</button>' +
    '<button class="btn" id="sosStop">Stop</button></div></section></div>';
}

function renderKits() {
  const checks = (key, items) => items.map((it, i) => {
    const id = 'kit-' + key + '-' + i;
    const on = localStorage.getItem(id) === '1';
    return '<label class="check"><input type="checkbox" data-check="' + id + '" ' + (on ? 'checked' : '') + '><span>' + it + '</span></label>';
  }).join('');
  return '<section class="panel" style="margin-bottom:.7rem"><h2>Kit tasca / EDC</h2>' +
    '<p>Quello che deve stare nello zaino anche per una passeggiata di due ore.</p>' +
    checks('tasca', KITS.tasca) + '</section>' +
    '<section class="panel" style="margin-bottom:.7rem"><h2>Uscita di un giorno</h2>' +
    checks('giorno', KITS.giorno) + '</section>' +
    '<section class="panel"><h2>Casa / 72 ore</h2>' + checks('casa', KITS.casa) + '</section>';
}

function renderMe() {
  const d = JSON.parse(localStorage.getItem('sv-me') || '{}');
  const v = (k) => d[k] || '';
  return '<section class="panel"><h2>Scheda medica sul telefono</h2>' +
    '<p class="small">Salvata solo in questo dispositivo. Duplica i dati nella scheda emergenza di iOS/Android.</p>' +
    '<label>Nome</label><input type="text" id="m-nome" value="' + v('nome') + '">' +
    '<label>Allergie</label><input type="text" id="m-all" value="' + v('all') + '">' +
    '<label>Farmaci e patologie</label><textarea id="m-farm" rows="3">' + v('farm') + '</textarea>' +
    '<label>Gruppo sanguigno</label><input type="text" id="m-sang" value="' + v('sang') + '">' +
    '<label>Contatto di fiducia</label><input type="text" id="m-tel" value="' + v('tel') + '" placeholder="Nome e numero">' +
    '<label>Note</label><textarea id="m-note" rows="3">' + v('note') + '</textarea>' +
    '<div class="actions"><button class="btn pri" id="saveMe">Salva sul telefono</button></div></section>' +
    '<section class="panel" style="margin-top:.7rem"><h2>Batteria</h2>' +
    '<p id="batt" class="small">Lettura batteria se il browser la consente.</p>' +
    '<p class="small">Modalita aereo, luminosita bassa, GPS a scatti, power bank. Al freddo tieni il telefono al caldo.</p></section>';
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
  $$("[data-open]").forEach((el) => el.onclick = () => openGuide(el.dataset.open));
  const q = $("#q");
  if (q) q.oninput = () => { $("#app").innerHTML = renderGuideList(q.value); bindGuideSearch(); };
  bindTools(); bindKits(); bindMe();
}

function bindGuideSearch() {
  $$("[data-open]").forEach((el) => el.onclick = () => openGuide(el.dataset.open));
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
    if (!state.pos) return alert("Ancora nessuna posizione.");
    const t = state.pos.coords.latitude.toFixed(6) + ", " + state.pos.coords.longitude.toFixed(6);
    navigator.clipboard && navigator.clipboard.writeText(t).then(() => alert("Coordinate copiate.")).catch(() => prompt("Copia:", t));
  };
  $("#smsPos").onclick = () => {
    const d = JSON.parse(localStorage.getItem("sv-me") || "{}");
    const who = d.nome ? d.nome + " " : "";
    const t = state.pos
      ? "SOS " + who + "pos: " + state.pos.coords.latitude.toFixed(6) + ", " + state.pos.coords.longitude.toFixed(6)
      : "SOS " + who + "posizione GPS non ancora fissa";
    location.href = "sms:?body=" + encodeURIComponent(t);
  };
  $("#compassBtn").onclick = enableCompass;
  if (state.heading != null) applyNeedle(state.heading);
  $("#sosFlash").onclick = () => document.body.classList.add("flash-sos");
  $("#sosStop").onclick = () => document.body.classList.remove("flash-sos");
}

function requestGeo() {
  if (!navigator.geolocation) return alert("GPS non disponibile su questo browser.");
  navigator.geolocation.getCurrentPosition(
    (pos) => { state.pos = pos; if (state.tab === "tools" && !state.guide) render(); },
    (err) => alert("GPS: " + err.message + ". Esci all'aperto e consenti la posizione."),
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
      if (res !== "granted") return alert("Permesso sensori negato.");
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
  if (t) t.textContent = Math.round(h) + "\u00b0 dal nord";
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
    const d = {
      nome: $("#m-nome").value,
      all: $("#m-all").value,
      farm: $("#m-farm").value,
      sang: $("#m-sang").value,
      tel: $("#m-tel").value,
      note: $("#m-note").value
    };
    localStorage.setItem("sv-me", JSON.stringify(d));
    btn.textContent = "Salvato";
  };
  if (navigator.getBattery) {
    navigator.getBattery().then((b) => {
      const el = $("#batt");
      if (el) el.textContent = "Batteria " + Math.round(b.level * 100) + "%" + (b.charging ? " in carica" : "");
    });
  }
}

function bindInstall() {
  document.addEventListener("click", (e) => {
    if (e.target.id === "installHint") {
      alert("Android/Chrome: menu Installa app. iPhone: Condividi, Aggiungi alla Home. Poi aprila SENZA rete.");
    }
  });
}

window.addEventListener("online", onlineChip);
window.addEventListener("offline", onlineChip);
$$(".nav button").forEach((b) => b.onclick = () => showTab(b.dataset.tab));
$("#sosTop").onclick = () => openGuide("112");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
onlineChip();
bindInstall();
render();
requestGeo();
