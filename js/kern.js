/* =========================================================================
   kern.js - hulpjes, geluid, slepen, tikken en de tekeningen
   Onderdeel van Rekenkitty. Alles werkt zonder internet.
   ========================================================================= */
"use strict";

/* ---------- eigen plaatjes (optioneel) ----------
   Zet je eigen plaatjes in het mapje "plaatjes" naast index.html:
       plaatjes/kitty.png       -> het poesje in de kop en op het beginscherm
       plaatjes/beloning1.png   -> wordt na een ronde getoond
       plaatjes/beloning2.png
       plaatjes/beloning3.png
   Ontbreken ze, dan tekent de app zelf een poesje. Er gaat dus nooit iets stuk. */
const EIGEN_PLAATJES = {
  mascotte: "plaatjes/kitty.png",
  beloningen: ["plaatjes/beloning1.png", "plaatjes/beloning2.png", "plaatjes/beloning3.png"]
};

/* ---------- kleine hulpjes ---------- */
const $ = (s, w) => (w || document).querySelector(s);
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const kies = a => a[rnd(0, a.length - 1)];
const schud = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const reeks = (n, f) => Array.from({ length: n }, (_, i) => f ? f(i) : i);

function el(tag, attrs, kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "class") e.className = attrs[k];
    else if (k === "html") e.innerHTML = attrs[k];
    else if (k === "tekst") e.textContent = attrs[k];
    else if (k === "stijl") e.setAttribute("style", attrs[k]);
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  (kids || []).forEach(k => e.appendChild(typeof k === "string" ? document.createTextNode(k) : k));
  return e;
}
function svg(inhoud, breedte, hoogte) {
  /* de omhullende div rekt mee, de tekening schaalt maar wordt nooit groter dan nodig */
  const d = el("div", { stijl: "width:100%;max-width:" + breedte + "px" });
  d.innerHTML = '<svg viewBox="0 0 ' + breedte + ' ' + hoogte + '" width="100%" style="display:block;margin:0 auto">' +
    inhoud + "</svg>";
  return d;
}

/* ---------- het poesje (zelfgetekend, en te vervangen door een eigen plaatje) ---------- */
function poesje(maat) {
  const t =
    '<path d="M18 42 L27 7 L54 27 Z" fill="#fff" stroke="#43263a" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M102 42 L93 7 L66 27 Z" fill="#fff" stroke="#43263a" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M27 16 L33 15 L44 25 Z" fill="#ffc4da"/>' +
    '<path d="M93 16 L87 15 L76 25 Z" fill="#ffc4da"/>' +
    '<ellipse cx="60" cy="60" rx="46" ry="36" fill="#fff" stroke="#43263a" stroke-width="3.5"/>' +
    '<ellipse cx="31" cy="68" rx="9" ry="5.5" fill="#ffc4da"/>' +
    '<ellipse cx="89" cy="68" rx="9" ry="5.5" fill="#ffc4da"/>' +
    '<ellipse cx="45" cy="56" rx="5.5" ry="7.5" fill="#43263a"/>' +
    '<ellipse cx="75" cy="56" rx="5.5" ry="7.5" fill="#43263a"/>' +
    '<circle cx="46.8" cy="53" r="2" fill="#fff"/><circle cx="76.8" cy="53" r="2" fill="#fff"/>' +
    '<ellipse cx="60" cy="66" rx="6.5" ry="4.5" fill="#ff85b3"/>' +
    '<path d="M52 74 q8 8 16 0" fill="none" stroke="#43263a" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M4 52 L26 56 M2 63 L26 63 M4 74 L26 70" stroke="#43263a" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M116 52 L94 56 M118 63 L94 63 M116 74 L94 70" stroke="#43263a" stroke-width="3" stroke-linecap="round"/>' +
    '<g transform="translate(95,24)">' +
    '<path d="M0 0 L-17 -11 L-17 11 Z" fill="#ff4d87" stroke="#c22458" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M0 0 L17 -11 L17 11 Z" fill="#ff4d87" stroke="#c22458" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="0" cy="0" r="6" fill="#ff85b3" stroke="#c22458" stroke-width="3"/></g>';
  const d = svg(t, 120, 100);
  if (maat) { d.style.width = maat + "px"; d.style.maxWidth = maat + "px"; }
  return d;
}
/* Toont een eigen plaatje als dat bestaat, anders het getekende poesje. */
/* bron mag ook een lijstje zijn: dan wordt het eerste plaatje genomen dat er echt is */
function poesjeOfPlaatje(bron, maat) {
  const houder = el("div", { stijl: "width:" + maat + "px;max-width:100%;margin:0 auto" });
  houder.appendChild(poesje(maat));
  const bronnen = [].concat(bron || []);
  const probeer = i => {
    if (i >= bronnen.length) return;
    const img = new Image();
    img.onload = () => {
      houder.innerHTML = "";
      img.style.width = "100%";
      img.style.display = "block";
      img.style.borderRadius = "20px";
      houder.appendChild(img);
    };
    img.onerror = () => probeer(i + 1);
    img.src = bronnen[i];
  };
  probeer(0);
  return houder;
}
/* ---------- geluidjes ---------- */
const Geluid = (() => {
  let ctx = null;
  function toon(f, t, duur, vol) {
    if (!Voortgang.geluid) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.14, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + duur);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + duur);
    } catch (e) {}
  }
  return {
    goed() { toon(660, 0, .13); toon(880, .1, .18); },
    fout() { toon(200, 0, .22, .1); },
    feest() { [523, 659, 784, 1047].forEach((f, i) => toon(f, i * .11, .25)); },
    klik() { toon(440, 0, .05, .06); }
  };
})();

/* =========================================================================
   Sleep & drop (met de muis en met de vinger)
   ========================================================================= */
let sleepBezig = null;
let opgepakt = null;      /* wat er met een tik is opgepakt */
let netGedropt = false;   /* voorkomt dat een tik meteen weer ongedaan wordt gemaakt */

function losmaken() {
  if (opgepakt) opgepakt.node.classList.remove("opgepakt");
  opgepakt = null;
}
function sleepbaar(node, gegevens, opties) {
  opties = opties || {};
  node.classList.add("sleep");
  node._gegevens = gegevens;
  node.addEventListener("pointerdown", ev => {
    ev.preventDefault();
    const klon = node.cloneNode(true);
    klon.classList.add("sleepklon");
    klon.style.width = node.offsetWidth + "px";
    klon.style.height = node.offsetHeight + "px";
    document.body.appendChild(klon);
    sleepBezig = { bron: node, klon, gegevens, kopie: !!opties.kopie, zone: null };
    verplaats(ev);
  });
  /* Tikken werkt ook, zodat slepen niet hoeft:
     - is er maar één plek om heen te gaan, dan gaat het er meteen heen;
     - zijn er meer plekken, dan pak je het eerst op en tik je daarna de goede plek aan. */
  node.addEventListener("click", () => {
    if (opties.opKlik) { opties.opKlik(node, gegevens); return; }
    if (opgepakt && opgepakt.node === node) { losmaken(); return; }
    losmaken();
    opgepakt = { node, gegevens, kopie: !!opties.kopie };
    node.classList.add("opgepakt");
    Geluid.klik();
  });
}
function verplaats(ev) {
  if (!sleepBezig) return;
  sleepBezig.klon.style.left = ev.clientX + "px";
  sleepBezig.klon.style.top = ev.clientY + "px";
  sleepBezig.klon.style.display = "none";
  const onder = document.elementFromPoint(ev.clientX, ev.clientY);
  sleepBezig.klon.style.display = "";
  const zone = onder && onder.closest ? onder.closest(".dropzone") : null;
  if (sleepBezig.zone !== zone) {
    if (sleepBezig.zone) sleepBezig.zone.classList.remove("hover");
    if (zone) zone.classList.add("hover");
    sleepBezig.zone = zone;
  }
}
document.addEventListener("pointermove", verplaats);
document.addEventListener("pointerup", ev => {
  if (!sleepBezig) return;
  const s = sleepBezig; sleepBezig = null;
  s.klon.remove();
  if (s.zone) {
    s.zone.classList.remove("hover");
    if (s.zone._opDrop) s.zone._opDrop(s.bron, s.gegevens, s.kopie);
  } else if (s.bron._buitenZone) {
    s.bron._buitenZone();
  }
});
function dropzone(node, opDrop) {
  node.classList.add("dropzone");
  node._opDrop = opDrop;
  /* een aangetikte plek neemt aan wat er opgepakt is */
  node.addEventListener("click", () => {
    if (!opgepakt) return;
    const o = opgepakt;
    losmaken();
    netGedropt = true;
    opDrop(o.node, o.gegevens, o.kopie);
    setTimeout(() => { netGedropt = false; }, 0);
  });
  return node;
}

/* =========================================================================
   Cijferpad. Op een tablet komt er nooit een toetsenbord in beeld:
   je tikt een vakje aan (dat wordt roze) en tikt daarna de cijfers.
   ========================================================================= */
let laatsteInvoer = null;

function zetActief(vak) {
  document.querySelectorAll(".num.actief").forEach(n => n.classList.remove("actief"));
  laatsteInvoer = vak || null;
  if (vak) vak.classList.add("actief");
}
function actiefVak() {
  if (laatsteInvoer && laatsteInvoer.isConnected) return laatsteInvoer;
  const eerste = $(".werkvlak .num");
  if (eerste) zetActief(eerste);
  return laatsteInvoer;
}
function tikCijfer(cijfer) {
  const i = actiefVak();
  if (i) i.value = (i.value + cijfer).slice(0, 3);
}
function volgendLeegVak() {
  const alle = [...document.querySelectorAll(".werkvlak .num")];
  return alle.find(x => x !== laatsteInvoer && x.value.trim() === "");
}

function cijferpad() {
  const pad = el("div", { class: "keypad" });
  const toets = (tekst, doe, klas) => pad.appendChild(el("button", {
    tekst, class: klas || "", type: "button",
    onclick: e => { e.preventDefault(); Geluid.klik(); doe(); }
  }));
  for (let n = 1; n <= 9; n++) toets(String(n), () => tikCijfer(String(n)));
  toets("0", () => tikCijfer("0"));
  toets("⌫", () => { const i = actiefVak(); if (i) i.value = i.value.slice(0, -1); }, "wis");
  return pad;
}
function invoerVak(breed) {
  const i = el("input", {
    class: "num", type: "text", readonly: "readonly", inputmode: "none",
    autocomplete: "off", maxlength: "3", tabindex: "-1"
  });
  if (breed) i.style.width = breed + "px";
  /* preventDefault houdt het schermtoetsenbord van de tablet dicht */
  i.addEventListener("pointerdown", e => { e.preventDefault(); zetActief(i); Geluid.klik(); });
  return i;
}

/* =========================================================================
   Vraag-bouwstenen
   ========================================================================= */
/* Invulvraag: alle .num velden in volgorde vergelijken met de antwoorden. */
function invulVraag(opdracht, bouw, antwoorden, uitleg, extra) {
  return Object.assign({
    opdracht, bouw, uitleg,
    check(vlak) {
      const v = [...vlak.querySelectorAll(".num")];
      return v.length === antwoorden.length && v.every((i, k) => i.value.trim() !== "" && Number(i.value) === antwoorden[k]);
    },
    /* na een eerste fout: alleen de foute vakjes leegmaken, cursor in het eerste */
    herstel(vlak) {
      const v = [...vlak.querySelectorAll(".num")];
      let eerste = null;
      v.forEach((i, k) => {
        if (i.value.trim() === "" || Number(i.value) !== antwoorden[k]) { i.value = ""; if (!eerste) eerste = i; }
      });
      if (eerste) zetActief(eerste);
    },
    toon(vlak) {
      [...vlak.querySelectorAll(".num")].forEach((i, k) => {
        if (Number(i.value) !== antwoorden[k]) { i.value = antwoorden[k]; i.classList.add("hersteld"); }
      });
    }
  }, extra || {});
}
/* Keuzevraag: knoppen; klikken levert meteen in.
   o = {opdracht, uitleg, opties, goed, inhoud(knop,optie,i), boven(vlak), plaatje} */
function keuzeVraag(o) {
  let gekozen = -1;
  return {
    opdracht: o.opdracht, uitleg: o.uitleg, directKlaar: true,
    bouw(vlak) {
      if (o.boven) o.boven(vlak);
      if (o.tussen) vlak.appendChild(el("div", { class: "label", tekst: o.tussen }));
      const rij = el("div", { class: "keuzes" });
      o.opties.forEach((opt, i) => {
        const k = el("button", { class: "keuze" + (o.plaatje ? " plaatje" : ""), type: "button" });
        o.inhoud(k, opt, i);
        k.addEventListener("click", () => {
          if (gekozen >= 0) return;
          gekozen = i;
          /* zodat het logboek weet welke knop ze koos */
          rij.querySelectorAll(".keuze").forEach(b => b.removeAttribute("data-gekozen"));
          k.setAttribute("data-gekozen", "");
          Motor.inleveren();
        });
        rij.appendChild(k);
      });
      vlak.appendChild(rij);
    },
    check() { return gekozen === o.goed; },
    herstel(vlak) {
      const k = [...vlak.querySelectorAll(".keuze")];
      if (k[gekozen]) k[gekozen].classList.add("foutgekozen");
      gekozen = -1;
    },
    toon(vlak) {
      const k = [...vlak.querySelectorAll(".keuze")];
      if (gekozen >= 0 && k[gekozen]) k[gekozen].classList.add("foutgekozen");
      if (k[o.goed]) k[o.goed].classList.add("goedgekozen");
    }
  };
}

/* =========================================================================
   Rekenplaatjes
   ========================================================================= */
/* Tienvlak (eierdoos-model) voor optellen en aftrekken tot 20 */
function tienvlakken(a, b, minteken) {
  const r = 15, sx = 38, W = 10 * sx + 20, H = 2 * sx + 20;
  let s = "";
  for (let i = 0; i < 20; i++) {
    const rij = i < 10 ? 0 : 1, kol = i % 10;
    const cx = 10 + kol * sx + sx / 2, cy = 10 + rij * sx + sx / 2;
    s += '<rect x="' + (10 + kol * sx) + '" y="' + (10 + rij * sx) + '" width="' + sx + '" height="' + sx +
      '" fill="#f7fbff" stroke="#cddcea" stroke-width="2"/>';
    let vul = null, streep = false;
    if (minteken) { if (i < a - b) vul = "#2f7ff0"; else if (i < a) { vul = "#f6b26b"; streep = true; } }
    else { if (i < a) vul = "#2f7ff0"; else if (i < a + b) vul = "#f6b26b"; }
    if (vul) {
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + vul + '"/>';
      if (streep) s += '<path d="M' + (cx - 10) + ' ' + (cy - 10) + ' L' + (cx + 10) + ' ' + (cy + 10) +
        ' M' + (cx + 10) + ' ' + (cy - 10) + ' L' + (cx - 10) + ' ' + (cy + 10) + '" stroke="#fff" stroke-width="4"/>';
    }
  }
  return svg(s, W, H);
}

/* Getallenlijn. Geeft {node, svg, xVan, waardeVan} terug. */
function getallenlijn(min, max, opties) {
  opties = opties || {};
  const W = 780, H = opties.hoogte || 120, pad = 40, basis = opties.basis || H - 40;
  const xVan = v => pad + (v - min) / (max - min) * (W - 2 * pad);
  const stapGroot = opties.groteStap || (max - min > 30 ? 10 : 5);
  const stapKlein = opties.kleineStap || (max - min > 30 ? 5 : 1);
  let s = '<line x1="' + (pad - 14) + '" y1="' + basis + '" x2="' + (W - pad + 14) + '" y2="' + basis +
    '" stroke="#12293d" stroke-width="3"/>';
  if ((max - min) / stapKlein <= 110) {
    for (let v = min; v <= max; v += stapKlein) if (v % stapGroot !== 0)
      s += '<line x1="' + xVan(v) + '" y1="' + (basis - 5) + '" x2="' + xVan(v) + '" y2="' + (basis + 5) + '" stroke="#9db4c8" stroke-width="2"/>';
  }
  for (let v = min; v <= max; v += stapGroot) {
    s += '<line x1="' + xVan(v) + '" y1="' + (basis - 11) + '" x2="' + xVan(v) + '" y2="' + (basis + 11) + '" stroke="#12293d" stroke-width="3"/>';
    s += '<text x="' + xVan(v) + '" y="' + (basis + 34) + '" text-anchor="middle" font-size="17" font-family="Trebuchet MS" fill="#12293d">' + v + "</text>";
  }
  const node = svg(s, W, H);
  return { node, svgEl: node.querySelector("svg"), xVan, W, H, basis, min, max, pad };
}
function boogje(x1, x2, y, tekst, kleur) {
  const top = y - Math.min(58, 22 + Math.abs(x2 - x1) * 0.35);
  return '<path d="M' + x1 + ' ' + y + ' Q ' + ((x1 + x2) / 2) + ' ' + top + ' ' + x2 + ' ' + y +
    '" fill="none" stroke="' + kleur + '" stroke-width="4" marker-end="url(#punt)"/>' +
    '<text x="' + ((x1 + x2) / 2) + '" y="' + (top + 6) + '" text-anchor="middle" font-size="17" font-weight="bold" font-family="Trebuchet MS" fill="' + kleur + '">' + tekst + "</text>";
}
const PIJLPUNT = '<defs><marker id="punt" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">' +
  '<path d="M0 0 L9 4.5 L0 9 z" fill="#e0324f"/></marker></defs>';

/* MAB-materiaal: tienstaaf en los blokje */
function tienstaaf(h) {
  h = h || 92;
  const b = 20, s = h / 10;
  let g = '<rect x="1" y="1" width="' + (b - 2) + '" height="' + (h - 2) + '" fill="#f4a83c" stroke="#b8761e" stroke-width="2" rx="3"/>';
  for (let i = 1; i < 10; i++) g += '<line x1="1" y1="' + (i * s) + '" x2="' + (b - 1) + '" y2="' + (i * s) + '" stroke="#b8761e" stroke-width="1.5"/>';
  const d = svg(g, b, h); d.style.width = b + "px"; d.style.display = "inline-block"; return d;
}
function losblokje(h) {
  h = h || 20;
  const d = svg('<rect x="1" y="1" width="' + (h - 2) + '" height="' + (h - 2) + '" fill="#5db2ff" stroke="#1f66c2" stroke-width="2" rx="3"/>', h, h);
  d.style.width = h + "px"; d.style.display = "inline-block"; return d;
}
/* Munt van 5, 10, 20 of 50 cent */
function muntje(waarde, maat) {
  maat = maat || 62;
  const goud = waarde >= 10, r = maat / 2 - 2, c = maat / 2;
  const buiten = goud ? "#e0b53c" : "#c98246", binnen = goud ? "#f5d97a" : "#e0a271", tk = "#6b4a12";
  const s = '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="' + buiten + '" stroke="#8a6a1e" stroke-width="2"/>' +
    '<circle cx="' + c + '" cy="' + c + '" r="' + (r - 4) + '" fill="' + binnen + '"/>' +
    '<text x="' + c + '" y="' + (c + 2) + '" text-anchor="middle" font-size="' + (maat * 0.36) +
    '" font-weight="bold" font-family="Trebuchet MS" fill="' + tk + '">' + waarde + '</text>' +
    '<text x="' + c + '" y="' + (c + maat * 0.29) + '" text-anchor="middle" font-size="' + (maat * 0.19) +
    '" font-family="Trebuchet MS" fill="' + tk + '">cent</text>';
  const d = svg(s, maat, maat);
  d.style.width = maat + "px"; d.style.display = "inline-block";
  return d;
}
