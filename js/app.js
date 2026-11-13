/* =========================================================================
   app.js - de schermen, de oefenronde en de puntentelling

   Een ronde is tien vragen: vijf lesdoelen uit blok 1 en vijf uit blok 2, door
   elkaar. De volgende ronde neemt de vijf die de vorige keer niet aan de beurt
   waren, zodat in elke twee rondes alle twintig lesdoelen langskomen.
   Alles past op één liggend tabletscherm; er hoeft nooit gescrold te worden.
   ========================================================================= */
"use strict";

const VRAGEN_PER_RONDE = 10;

/* Een ronde van blok 3: twee tafelvragen (eentje in de eerste helft, eentje in de
   tweede), tot vier andere lesdoelen van blok 3 die al vrij zijn, en de rest
   herhaling uit blok 2 en blok 1. Een lesdoel dat net vrij is gekomen zit er
   altijd meteen in. */
function maakRondeBlok3() {
  const open = Blok3.open();
  const tafels = open.includes("tafel3") ? schud(["tafels", "tafel3"]) : ["tafels", "tafels"];
  const overig = open.filter(id => id !== "tafels" && id !== "tafel3");
  const aantal = Math.min(4, overig.length);
  let b3 = overig.filter(id => Voortgang.statsVan(id).totaal === 0).slice(0, aantal);
  const rest = overig.filter(id => !b3.includes(id));
  if (b3.length < aantal) b3 = b3.concat(Voortgang.kiesUit("blok3", rest, aantal - b3.length));
  const herhaling = VRAGEN_PER_RONDE - tafels.length - b3.length;
  const n2 = Math.ceil(herhaling / 2), n1 = herhaling - n2;
  const lijst = schud(b3.concat(Voortgang.kiesUit("blok2", SPELVOLGORDE_BLOK2, n2), Voortgang.kiesUit("blok1", SPELVOLGORDE, n1)));
  lijst.splice(rnd(0, 3), 0, tafels[0]);
  lijst.splice(rnd(6, lijst.length), 0, tafels[1]);
  return lijst;
}

const RONDESOORTEN = {
  blok3: { naam: "Blok 3", maak: maakRondeBlok3 },
  samen: {
    naam: "Blok 1 en 2",
    maak: () => schud(Voortgang.kiesUit("blok1", SPELVOLGORDE, 5).concat(Voortgang.kiesUit("blok2", SPELVOLGORDE_BLOK2, 5)))
  },
  /* de soorten hieronder worden niet meer aangeboden; ze staan er nog zodat een
     ronde die met een oudere versie begonnen is, gewoon afgemaakt kan worden */
  blok2: { naam: "Blok 2", maak: () => schud(SPELVOLGORDE_BLOK2) },
  blok1: { naam: "Blok 1", maak: () => schud(SPELVOLGORDE) },
  mix: { naam: "Door elkaar", maak: () => schud(schud(SPELVOLGORDE).slice(0, 5).concat(schud(SPELVOLGORDE_BLOK2).slice(0, 5))) }
};
const LOF = ["Goed zo!", "Top!", "Knap gedaan!", "Yes!", "Super!", "Helemaal goed!", "Prima!", "Wat slim!"];
const BIJNA = ["Bijna! Kijk nog eens goed.", "Net niet. Probeer het nog een keer.", "Nog eentje proberen?"];

const scherm = document.getElementById("scherm");
const onderbalk = document.getElementById("onderbalk");

/* =========================================================================
   Kop en meldingen
   ========================================================================= */
function kop() {
  document.getElementById("rang").textContent = Voortgang.rang();
  document.getElementById("niveaulabel").textContent = "niveau " + Voortgang.niveau();
  document.getElementById("puntenbalk").style.width = (Voortgang.deelVanNiveau() * 100) + "%";
  document.getElementById("puntenchip").textContent = "⭐ " + Voortgang.punten;
  const dag = document.getElementById("dagchip");
  dag.textContent = "🔥 " + Voortgang.dagen;
  dag.style.display = Voortgang.dagen > 0 ? "" : "none";
  document.getElementById("geluidknop").textContent = Voortgang.geluid ? "🔊" : "🔇";
  document.getElementById("huisknop").style.visibility = Motor.actief ? "visible" : "hidden";
}

let toastTimer = null;
function melding(tekst, duur) {
  const t = document.getElementById("toast");
  t.textContent = tekst;
  t.classList.add("zichtbaar");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("zichtbaar"), duur || 1800);
}

/* Krimpt de inhoud van de kaart als hij niet past. Zo hoeft er nooit gescrold
   te worden, ook niet op een klein liggend scherm. */
function passendMaken() {
  const vlak = document.querySelector(".werkvlak");
  const inhoud = vlak && vlak.querySelector(".werkinhoud");
  if (!inhoud) return;
  inhoud.style.transform = "";
  const ruimte = vlak.clientHeight;
  const nodig = inhoud.scrollHeight;
  if (nodig > ruimte && ruimte > 60) {
    const k = Math.max(0.4, ruimte / nodig);
    inhoud.style.transformOrigin = "center center";
    inhoud.style.transform = "scale(" + k + ")";
  }
}
window.addEventListener("resize", passendMaken);
window.addEventListener("orientationchange", () => setTimeout(passendMaken, 300));

/* =========================================================================
   Startscherm
   ========================================================================= */
function toonStart() {
  Motor.actief = false;
  scherm.innerHTML = "";
  onderbalk.innerHTML = "";
  onderbalk.className = "";

  const hervat = Voortgang.ronde && Voortgang.ronde.nr > 0 && Voortgang.ronde.nr < VRAGEN_PER_RONDE;

  const links = el("div", { class: "startlinks" });
  links.appendChild(poesjeOfPlaatje(EIGEN_PLAATJES.mascotte, 112));
  links.appendChild(el("h2", { tekst: "Hoi! 🎀" }));
  if (hervat) {
    const soort = RONDESOORTEN[Voortgang.ronde.soort];
    links.appendChild(el("p", {
      class: "klein",
      tekst: "Je was bezig met een ronde" + (soort ? " (" + soort.naam.toLowerCase() + ")" : "") + ". Je punten staan nog gewoon klaar!"
    }));
    links.appendChild(el("button", {
      class: "knop groot", type: "button", tekst: "▶ Verder met vraag " + (Voortgang.ronde.nr + 1),
      onclick: () => { Geluid.klik(); Motor.begin(true); }
    }));
    links.appendChild(el("button", {
      class: "tekstknop", type: "button", tekst: "Liever helemaal opnieuw beginnen",
      onclick: () => { Voortgang.vergeetRonde(); toonStart(); }
    }));
  } else {
    links.appendChild(el("p", { class: "klein", tekst: "Tien vragen: de tafels, nieuwe dingen uit blok 3 en een beetje herhaling." }));
    links.appendChild(el("button", {
      class: "knop groot", type: "button", tekst: "▶ Start",
      onclick: () => { Geluid.klik(); Motor.begin(false, "blok3"); }
    }));
  }

  const rechts = el("div", { class: "startrechts" });
  rechts.appendChild(el("div", { class: "grootgetal", html: "⭐ " + Voortgang.punten }));
  rechts.appendChild(el("div", { class: "klein", tekst: "punten in totaal" }));
  rechts.appendChild(el("div", { class: "rangregel", html: "<b>" + Voortgang.rang() + "</b> · niveau " + Voortgang.niveau() }));
  const balk = el("div", { class: "balk" });
  balk.appendChild(el("i", { stijl: "width:" + (Voortgang.deelVanNiveau() * 100) + "%" }));
  rechts.appendChild(balk);
  rechts.appendChild(el("div", { class: "klein", tekst: "nog " + Voortgang.naarVolgend() + " punten tot niveau " + (Voortgang.niveau() + 1) }));

  if (Voortgang.dagen > 0) rechts.appendChild(el("div", {
    class: "dagreeks",
    html: "🔥 <b>" + Voortgang.dagen + "</b> " + (Voortgang.dagen === 1 ? "dag" : "dagen op rij") + " geoefend"
  }));

  const kastje = el("div", { class: "stickerrij" });
  const verdiend = Voortgang.verdiend();
  STICKERS.slice(Math.max(0, verdiend - 5), Math.max(5, verdiend)).forEach((st, i) => {
    const echt = Math.max(0, verdiend - 5) + i;
    kastje.appendChild(stickerBol(echt, echt < verdiend, 46));
  });
  rechts.appendChild(kastje);
  rechts.appendChild(el("button", {
    class: "knop stil", type: "button",
    tekst: "🎁 Mijn stickers (" + verdiend + "/" + STICKERS.length + ")",
    onclick: () => { Geluid.klik(); toonStickers(); }
  }));

  const rij = el("div", { class: "start" }, [links, rechts]);
  scherm.appendChild(rij);
  scherm.appendChild(el("button", {
    class: "tekstknop ouderknop", type: "button", tekst: "Voor papa, mama of de juf",
    onclick: toonOuders
  }));
  kop();
}

/* =========================================================================
   Stickerkast
   ========================================================================= */
function stickerBol(i, vrij, maat) {
  const st = STICKERS[i];
  const d = el("div", {
    class: "sticker" + (vrij ? "" : " op-slot"),
    stijl: "width:" + maat + "px;height:" + maat + "px;font-size:" + Math.round(maat * 0.55) +
      "px;background:" + (vrij ? st.kleur : "#efe6ec"),
    tekst: vrij ? st.emoji : "🔒",
    title: vrij ? st.naam : "Nog niet vrijgespeeld"
  });
  return d;
}
function toonStickers() {
  Motor.actief = false;
  scherm.innerHTML = "";
  onderbalk.innerHTML = "";
  onderbalk.className = "";
  const kaart = el("div", { class: "kaart schuif" });
  kaart.appendChild(el("h2", { class: "titelregel", tekst: "Mijn stickers" }));
  const rooster = el("div", { class: "stickerkast" });
  const verdiend = Voortgang.verdiend();
  STICKERS.forEach((st, i) => {
    const vak = el("div", { class: "stickervak" });
    vak.appendChild(stickerBol(i, i < verdiend, 50));
    vak.appendChild(el("div", { class: "klein", tekst: i < verdiend ? st.naam : "?" }));
    rooster.appendChild(vak);
  });
  kaart.appendChild(rooster);
  kaart.appendChild(el("p", {
    class: "klein midden",
    tekst: verdiend >= STICKERS.length
      ? "Je hebt ze allemaal! 🎉"
      : "Nog " + Voortgang.puntenTotVolgendeSticker() + " punten tot de volgende sticker."
  }));
  scherm.appendChild(kaart);
  onderbalk.appendChild(el("button", { class: "knop", type: "button", tekst: "← Terug", onclick: toonStart }));
  kop();
}

/* =========================================================================
   Ouderhoek
   ========================================================================= */
const DAG = 864e5;
const PERIODES = [
  { naam: "Vandaag", vanaf: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); } },
  { naam: "7 dagen", vanaf: () => { const d = new Date(Date.now() - 6 * DAG); d.setHours(0, 0, 0, 0); return d.getTime(); } },
  { naam: "30 dagen", vanaf: () => { const d = new Date(Date.now() - 29 * DAG); d.setHours(0, 0, 0, 0); return d.getTime(); } },
  { naam: "Alles", vanaf: () => 0 }
];
const ouderKeuze = { periode: 1, alleenFout: true };   /* blijft staan zolang de app open is */

const UITSLAG = { 2: ["✅", "in één keer goed"], 1: ["🟡", "goed bij de 2e poging"], 0: ["❌", "niet goed"] };
const datumKort = t => new Date(t).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
const datumLang = t => new Date(t).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
const tijdKort = t => new Date(t).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
const doelNaam = id => SPELLEN[id] ? SPELLEN[id].emoji + " " + SPELLEN[id].titel : id;
const blokVan = id => SPELVOLGORDE_BLOK3.includes(id) ? 3 : SPELVOLGORDE_BLOK2.includes(id) ? 2 : 1;
const ALLE_BLOKKEN = [SPELVOLGORDE_BLOK3, SPELVOLGORDE_BLOK2, SPELVOLGORDE];
const veilig = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* Wat ze antwoordde, in woorden: "eerst 12, daarna 13" */
function pogingenTekst(r) {
  const a = r.a || [];
  if (!a.length || a.every(x => x == null)) return "";
  if (a.length === 1) return a[0];
  return "eerst " + (a[0] == null ? "(zie plaatje)" : a[0]) + ", daarna " + (a[1] == null ? "(zie plaatje)" : a[1]);
}

function telOp(regels) {
  const t = { 2: 0, 1: 0, 0: 0, rondes: new Set(regels.map(r => r.rid)).size, perDoel: {} };
  regels.forEach(r => {
    t[r.r]++;
    const p = t.perDoel[r.d] || (t.perDoel[r.d] = { 2: 0, 1: 0, 0: 0 });
    p[r.r]++;
  });
  return t;
}

function rapportTekst(pi) {
  const regels = Logboek.sinds(PERIODES[pi].vanaf());
  const t = telOp(regels);
  const uit = [];
  const van = regels.length ? regels[0].t : Date.now();
  uit.push("Rekenkitty – " + (pi === 0 || datumLang(van) === datumLang(Date.now())
    ? datumLang(Date.now()) : datumLang(van) + " t/m " + datumLang(Date.now())));
  if (!regels.length) { uit.push("", "In deze periode is er niet geoefend."); return uit.join("\n"); }
  uit.push(t.rondes + (t.rondes === 1 ? " ronde, " : " rondes, ") + regels.length + " vragen: " +
    t[2] + " in één keer goed, " + t[1] + " goed bij de 2e poging, " + t[0] + " niet goed.");
  uit.push("", "Per lesdoel (✅ in één keer / 🟡 2e poging / ❌ niet goed, en het niveau nu):");
  ALLE_BLOKKEN.forEach(ids => ids.forEach(id => {
    const p = t.perDoel[id];
    if (p) uit.push("• " + SPELLEN[id].titel + " (blok " + blokVan(id) + "): ✅ " + p[2] + "  🟡 " + p[1] +
      "  ❌ " + p[0] + "  – niveau " + Voortgang.niveauVan(id));
  }));
  const mis = regels.filter(r => r.r < 2).reverse();
  if (mis.length) {
    uit.push("", "Niet in één keer goed (nieuwste eerst):");
    mis.slice(0, 40).forEach(r => {
      const ant = pogingenTekst(r);
      let regel = UITSLAG[r.r][0] + " " + datumKort(r.t) + " · " + (SPELLEN[r.d] ? SPELLEN[r.d].titel : r.d) +
        " (niveau " + r.n + "): " + r.o;
      if (ant) regel += " — zij: " + ant;
      if (r.r === 0 && r.g) regel += " — goed is: " + r.g;
      else if (r.r === 0 && r.u) regel += " — uitleg: " + r.u;
      uit.push(regel);
    });
    if (mis.length > 40) uit.push("… en nog " + (mis.length - 40) + " eerder.");
  } else uit.push("", "Alles in één keer goed! 🎉");
  return uit.join("\n");
}

function venster(titel, inhoud, knoppen) {
  const achter = el("div", { class: "venster" });
  const doos = el("div", { class: "vensterdoos" });
  const sluit = () => achter.remove();
  doos.appendChild(el("div", { class: "vensterkop" }, [
    el("h3", { tekst: titel }),
    el("button", { class: "rondknop", type: "button", tekst: "✕", title: "Sluiten", onclick: sluit })
  ]));
  doos.appendChild(inhoud);
  if (knoppen) doos.appendChild(el("div", { class: "vensterknoppen" }, knoppen));
  achter.appendChild(doos);
  achter.addEventListener("click", e => { if (e.target === achter) sluit(); });
  document.body.appendChild(achter);
  return { sluit, doos };
}

async function verstuurRapport() {
  const tekst = rapportTekst(ouderKeuze.periode);
  if (navigator.share) {
    try { await navigator.share({ title: "Rekenkitty-rapport", text: tekst }); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  /* geen deelmenu (bijvoorbeeld op een computer): laat de tekst zien om te kopiëren */
  const vak = el("textarea", { class: "rapporttekst", readonly: "readonly" });
  vak.value = tekst;
  venster("Rapport", vak, [
    el("button", {
      class: "knop", type: "button", tekst: "📋 Kopiëren",
      onclick() {
        const klaar = () => melding("Gekopieerd");
        if (navigator.clipboard) navigator.clipboard.writeText(tekst).then(klaar, () => { vak.select(); document.execCommand("copy"); klaar(); });
        else { vak.select(); document.execCommand("copy"); klaar(); }
      }
    })
  ]);
}

function toonKiekjes(r) {
  const inhoud = el("div", { class: "kiekjes" });
  let html = "<b>" + doelNaam(r.d) + "</b> · niveau " + r.n + " · " + datumKort(r.t) + " " + tijdKort(r.t) +
    " · " + UITSLAG[r.r][0] + " " + UITSLAG[r.r][1];
  const ant = pogingenTekst(r);
  if (ant) html += "<br>Zij antwoordde: <b>" + veilig(ant) + "</b>";
  if (r.r === 0 && r.g) html += " · goed is: <b>" + veilig(r.g) + "</b>";
  if (r.u) html += "<br>Uitleg in de app: " + veilig(r.u);
  inhoud.appendChild(el("p", { class: "klein", html }));
  const rij = el("div", { class: "kiekjesrij" });
  (r.k || []).forEach(k => {
    const vak = el("div", { class: "kiekjesvak" });
    vak.appendChild(el("div", { class: "label", tekst: k.l }));
    const raam = el("div", { class: "kiekjesraam" });
    raam.appendChild(el("div", { class: "werkinhoud", html: k.h }));
    vak.appendChild(raam);
    rij.appendChild(vak);
  });
  inhoud.appendChild(rij);
  venster(r.o, inhoud);
  /* elk kiekje verkleinen tot het in zijn vak past */
  requestAnimationFrame(() => rij.querySelectorAll(".kiekjesraam").forEach(raam => {
    const w = raam.firstChild;
    const k = Math.min(1, raam.clientWidth / Math.max(1, w.scrollWidth), raam.clientHeight / Math.max(1, w.scrollHeight));
    w.style.transformOrigin = "center center";
    w.style.transform = "scale(" + k + ")";
  }));
}

function toonOuders() {
  Motor.actief = false;
  scherm.innerHTML = "";
  onderbalk.innerHTML = "";
  onderbalk.className = "";
  const kaart = el("div", { class: "kaart schuif" });

  kaart.appendChild(el("div", { class: "ouderkop" }, [
    el("h2", { class: "titelregel", tekst: "Voor papa, mama of de juf" }),
    el("button", { class: "knop", type: "button", tekst: "📤 Rapport versturen", onclick: verstuurRapport })
  ]));

  const chips = (opties, actief, kies) => el("div", { class: "chiprij" }, opties.map((o, i) =>
    el("button", { class: "keuzechip" + (i === actief ? " aan" : ""), type: "button", tekst: o, onclick: () => kies(i) })));
  kaart.appendChild(chips(PERIODES.map(p => p.naam), ouderKeuze.periode, i => { ouderKeuze.periode = i; toonOuders(); }));

  const regels = Logboek.sinds(PERIODES[ouderKeuze.periode].vanaf());
  const t = telOp(regels);
  if (!regels.length) {
    kaart.appendChild(el("p", {
      class: "klein",
      tekst: Logboek.aantal ? "In deze periode is er niet geoefend."
        : "Hier komt te staan welke vragen ze gemaakt heeft en wat ze antwoordde. Dat wordt bijgehouden vanaf deze versie van de app; eerdere vragen tellen alleen mee in de totalen onderaan."
    }));
  } else {
    kaart.appendChild(el("p", {
      class: "samenvatting",
      html: "<b>" + t.rondes + "</b> " + (t.rondes === 1 ? "ronde" : "rondes") + " · <b>" + regels.length + "</b> vragen · ✅ <b>" + t[2] +
        "</b> in één keer goed · 🟡 <b>" + t[1] + "</b> bij de 2e poging · ❌ <b>" + t[0] + "</b> niet goed"
    }));

    const tabel = el("table", { class: "oudertabel" });
    let html = "<tr><th>Lesdoel</th><th>✅</th><th>🟡</th><th>❌</th><th>Niveau nu</th></tr>";
    ALLE_BLOKKEN.forEach(ids => ids.forEach(id => {
      const p = t.perDoel[id];
      if (!p) return;
      html += "<tr" + (p[0] ? " class='zorg'" : "") + "><td>" + doelNaam(id) + " <span class='klein'>(blok " + blokVan(id) +
        ")</span></td><td>" + p[2] + "</td><td>" + p[1] + "</td><td>" + p[0] + "</td><td>" + Voortgang.niveauVan(id) + "</td></tr>";
    }));
    tabel.innerHTML = html;
    kaart.appendChild(tabel);

    kaart.appendChild(el("h3", { class: "tussenkop", tekst: "De vragen" }));
    kaart.appendChild(chips(["Alleen wat niet in één keer goed ging", "Alle vragen"], ouderKeuze.alleenFout ? 0 : 1,
      i => { ouderKeuze.alleenFout = i === 0; toonOuders(); }));
    const lijst = (ouderKeuze.alleenFout ? regels.filter(r => r.r < 2) : regels).slice().reverse();
    if (!lijst.length) kaart.appendChild(el("p", { class: "klein", tekst: "Alles in één keer goed! 🎉" }));
    const log = el("div", { class: "logboek" });
    let dag = "";
    lijst.slice(0, 300).forEach(r => {
      const d = datumLang(r.t);
      if (d !== dag) { dag = d; log.appendChild(el("div", { class: "logdag", tekst: d })); }
      const ant = pogingenTekst(r);
      let h = "<span class='logic'>" + UITSLAG[r.r][0] + "</span>" +
        "<span class='logtijd'>" + tijdKort(r.t) + "</span>" +
        "<span class='logwat'><span class='klein'>" + doelNaam(r.d) + " · niveau " + r.n + "</span><br>" + veilig(r.o);
      const goedIs = r.r === 0 && r.g ? "goed is: <b>" + veilig(r.g) + "</b>" : "";
      if (ant) h += "<br><span class='logant'>Zij: <b>" + veilig(ant) + "</b>" + (goedIs ? " · " + goedIs : "") + "</span>";
      else if (goedIs) h += "<br><span class='logant'>" + goedIs.charAt(0).toUpperCase() + goedIs.slice(1) + "</span>";
      h += "</span>";
      const rij = el("div", { class: "logregel" + (r.r === 0 ? " fout" : r.r === 1 ? " half" : ""), html: h });
      if (r.k && r.k.length) rij.appendChild(el("button", {
        class: "knop stil klein-knop", type: "button", tekst: "🔍 Bekijk", onclick: () => toonKiekjes(r)
      }));
      log.appendChild(rij);
    });
    kaart.appendChild(log);
  }

  kaart.appendChild(el("h3", { class: "tussenkop", tekst: "Sinds het begin" }));
  const tabel = el("table", { class: "oudertabel" });
  let html = "";
  [["Blok 3", SPELVOLGORDE_BLOK3], ["Blok 2", SPELVOLGORDE_BLOK2], ["Blok 1", SPELVOLGORDE]].forEach(([blok, ids]) => {
    html += "<tr><th>" + blok + "</th><th>Niveau</th><th>In één keer goed</th></tr>";
    ids.forEach(id => {
      const s = Voortgang.statsVan(id);
      const pct = s.totaal ? Math.round(s.goed / s.totaal * 100) + "%" : "–";
      const dicht = blokVan(id) === 3 && !Blok3.isOpen(id);
      html += "<tr><td>" + SPELLEN[id].doel + (dicht ? " <span class='klein'>(nog niet vrij)</span>" : "") +
        "</td><td>" + Voortgang.niveauVan(id) +
        "</td><td>" + s.goed + " / " + s.totaal + " <span class='klein'>(" + pct + ")</span></td></tr>";
    });
  });
  tabel.innerHTML = html;
  kaart.appendChild(tabel);
  kaart.appendChild(el("p", {
    class: "klein",
    html: "Totaal: <b>" + Voortgang.punten + "</b> punten, " + Voortgang.rondes + " afgeronde rondes, " +
      Voortgang.verdiend() + " van de " + STICKERS.length + " stickers."
  }));

  /* blok 3 komt stap voor stap vrij */
  kaart.appendChild(el("h3", { class: "tussenkop", tekst: "Blok 3: wat komt wanneer" }));
  const lijstB3 = el("ul", { class: "klein", stijl: "margin:4px 0;padding-left:20px;line-height:1.6" });
  SPELVOLGORDE_BLOK3.forEach(id => {
    const open = Blok3.isOpen(id);
    lijstB3.appendChild(el("li", {
      html: (open ? "✅ " : "🔒 ") + SPELLEN[id].doel +
        (open ? "" : " <i>(komt over " + Blok3.rondesTot(id) + (Blok3.rondesTot(id) === 1 ? " ronde" : " rondes") + ")</i>")
    }));
  });
  kaart.appendChild(lijstB3);
  const volgende = SPELVOLGORDE_BLOK3.find(id => !Blok3.isOpen(id));
  if (volgende) kaart.appendChild(el("div", { class: "midden" }, [el("button", {
    class: "knop stil", type: "button", tekst: "🔓 " + SPELLEN[volgende].titel + " nu al vrijgeven",
    onclick() { Voortgang.geefBlok3Vrij(); melding(SPELLEN[volgende].titel + " is vrij"); toonOuders(); }
  })]));
  kaart.appendChild(el("h3", { class: "tussenkop", tekst: "Hoe de app werkt" }));
  kaart.appendChild(el("p", {
    class: "klein",
    html: "Elke ronde bestaat uit tien vragen. Twee daarvan zijn altijd de tafels (2, 5 en 10, en later ook 3). " +
      "Daarnaast tot vier andere onderwerpen uit blok 3 en de rest herhaling uit blok 2 en blok 1. " +
      "De lesdoelen van blok 3 komen niet allemaal tegelijk: eerst de tafels, plus en min tot 100 en verdubbelen/halveren, " +
      "daarna om de paar rondes iets nieuws (kwartieren, kilogram en gram, omtrek) en als laatste de tafel van 3. " +
      "Is de juf al verder? Met de knop hierboven geef je het volgende lesdoel eerder vrij."
  }));
  kaart.appendChild(el("p", {
    class: "klein",
    html: "Elk lesdoel heeft een eigen niveau (1, 2 of 3) dat meebeweegt: twee keer achter elkaar in één keer goed " +
      "en het wordt moeilijker, een fout maakt het weer makkelijker. Bij een fout mag ze het altijd eerst nog een keer zelf " +
      "proberen; pas daarna volgt het antwoord met uitleg. Er staat geen klok bij."
  }));
  kaart.appendChild(el("p", {
    class: "klein",
    html: "Alles staat alleen in de browser van dit apparaat. Het logboek bewaart de laatste 600 vragen, " +
      "en bij de laatste 60 fouten ook een plaatje van de vraag zoals zij hem achterliet (🔍 Bekijk). " +
      "Bij sleep- en tikopdrachten staat haar antwoord alleen in dat plaatje. " +
      "<b>Rapport versturen</b> deelt een tekstje over de gekozen periode, bijvoorbeeld via WhatsApp of mail."
  }));
  kaart.appendChild(el("div", { class: "midden" }, [
    el("button", {
      class: "knop stil", type: "button", tekst: "Alles wissen en opnieuw beginnen",
      onclick() {
        if (confirm("Alle punten, stickers, niveaus en het logboek wissen?")) { Voortgang.wisAlles(); Logboek.wis(); toonStart(); }
      }
    })
  ]));
  scherm.appendChild(kaart);
  onderbalk.appendChild(el("button", { class: "knop", type: "button", tekst: "← Terug", onclick: toonStart }));
  kop();
}

/* =========================================================================
   De oefenronde
   ========================================================================= */
const Motor = {
  actief: false, soort: "samen", volgorde: [], nr: 0, puntenRonde: 0, goedOpRij: 0, resultaten: [], rid: 0,
  doel: null, niveau: 1, vraag: null, poging: 0, bezig: false, werkvlak: null,

  begin(hervat, soort) {
    const opgeslagen = Voortgang.ronde;
    if (hervat && opgeslagen) {
      this.soort = opgeslagen.soort || "blok1";   /* rondes van vóór blok 2 waren altijd blok 1 */
      this.volgorde = opgeslagen.volgorde.filter(id => SPELLEN[id]);
      this.nr = opgeslagen.nr;
      this.puntenRonde = opgeslagen.punten;
      this.goedOpRij = opgeslagen.goedOpRij || 0;
      this.resultaten = opgeslagen.resultaten || [];
      this.rid = opgeslagen.rid || Date.now();
    } else {
      this.soort = RONDESOORTEN[soort] ? soort : "samen";
      this.volgorde = RONDESOORTEN[this.soort].maak();
      this.nr = 0; this.puntenRonde = 0; this.goedOpRij = 0; this.resultaten = []; this.rid = Date.now();
      if (Voortgang.nieuweDag()) {
        Voortgang.telPunten(BONUS_NIEUWE_DAG);
        this.puntenRonde += BONUS_NIEUWE_DAG;
        setTimeout(() => melding("Eerste ronde van vandaag! +" + BONUS_NIEUWE_DAG + " punten 🔥", 2600), 400);
      }
      /* iets nieuws erbij? dat mag ze weten */
      const nieuw = this.volgorde.filter((id, i, a) => blokVan(id) === 3 && a.indexOf(id) === i && Voortgang.statsVan(id).totaal === 0);
      if (nieuw.length) setTimeout(() => melding("✨ Nieuw: " + nieuw.map(id => SPELLEN[id].titel).join(" en ") + "!", 3200),
        this.puntenRonde ? 3200 : 400);
    }
    this.actief = true;
    this.volgende();
  },

  bewaarStand() {
    Voortgang.bewaarRonde({
      soort: this.soort, volgorde: this.volgorde, nr: this.nr, punten: this.puntenRonde,
      goedOpRij: this.goedOpRij, resultaten: this.resultaten, rid: this.rid
    });
  },

  volgende() {
    if (this.nr >= VRAGEN_PER_RONDE || this.nr >= this.volgorde.length) return this.einde();
    this.doel = this.volgorde[this.nr];
    this.niveau = Voortgang.niveauVan(this.doel);
    this.vraag = SPELLEN[this.doel].maak(this.niveau);
    Logboek.nieuweVraag(this.doel, this.niveau, this.vraag, this.rid);
    this.poging = 0;
    this.bezig = false;
    this.teken();
  },

  teken() {
    const q = this.vraag;
    scherm.innerHTML = "";

    const kaart = el("div", { class: "kaart" });
    const balkje = el("div", { class: "stippen" });
    for (let i = 0; i < VRAGEN_PER_RONDE; i++) {
      const r = this.resultaten[i];
      balkje.appendChild(el("span", {
        class: "stip" + (r === 2 ? " goed" : r === 1 ? " half" : r === 0 ? " fout" : i === this.nr ? " nu" : "")
      }));
    }
    const kopregel = el("div", { class: "kaartkop" }, [
      balkje,
      el("span", { class: "doellabel", tekst: SPELLEN[this.doel].emoji + " " + SPELLEN[this.doel].titel })
    ]);
    kaart.appendChild(kopregel);
    kaart.appendChild(el("h2", { class: "opdracht", html: q.opdracht }));
    const vlak = el("div", { class: "werkvlak" });
    const inhoud = el("div", { class: "werkinhoud" });
    vlak.appendChild(inhoud);
    this.werkvlak = inhoud;
    kaart.appendChild(vlak);
    q.bouw(inhoud);
    scherm.appendChild(kaart);

    /* het cijferpad hoort onderaan het scherm, niet midden in de vraag */
    onderbalk.innerHTML = "";
    onderbalk.className = "";
    const pad = inhoud.querySelector(".keypad");
    if (q.hulp) {
      let open = false, hulpNode = null;
      onderbalk.appendChild(el("button", {
        class: "knop stil", type: "button", tekst: "💡 Hulp",
        onclick(e) {
          open = !open;
          if (open) { hulpNode = q.hulp(); inhoud.appendChild(hulpNode); e.target.textContent = "💡 Hulp weg"; }
          else { if (hulpNode) hulpNode.remove(); e.target.textContent = "💡 Hulp"; }
          passendMaken();
        }
      }));
    }
    if (pad) onderbalk.appendChild(pad);
    if (!q.directKlaar) onderbalk.appendChild(el("button", {
      class: "knop groot", id: "klaarknop", type: "button", tekst: "Klaar!",
      onclick: () => this.inleveren()
    }));
    else onderbalk.appendChild(el("div", { class: "hint", tekst: "Tik het goede antwoord aan" }));

    losmaken();
    zetActief(inhoud.querySelector(".num"));
    kop();
    requestAnimationFrame(passendMaken);
  },

  inleveren() {
    if (this.bezig) return;
    const q = this.vraag, vlak = this.werkvlak;
    let goed = false;
    let antwoord = null;
    try { antwoord = Logboek.leesAntwoord(vlak, q); } catch (e) {}
    try { goed = !!q.check(vlak); } catch (e) { goed = false; }

    if (goed) {
      this.bezig = true;
      const eersteKeer = this.poging === 0;
      const punten = eersteKeer ? PUNTEN_EERSTE_KEER : PUNTEN_TWEEDE_KEER;
      this.puntenRonde += punten;
      Voortgang.telPunten(punten);
      Voortgang.noteer(this.doel, eersteKeer);
      Voortgang.pasNiveauAan(this.doel, eersteKeer);
      this.resultaten[this.nr] = eersteKeer ? 2 : 1;
      if (!eersteKeer) Logboek.zetUitleg(q.uitleg);
      Logboek.goed(antwoord, eersteKeer);

      let extra = "";
      if (eersteKeer) {
        this.goedOpRij++;
        if (this.goedOpRij % 3 === 0) {
          this.puntenRonde += BONUS_DRIE_OP_RIJ;
          Voortgang.telPunten(BONUS_DRIE_OP_RIJ);
          extra = " +" + BONUS_DRIE_OP_RIJ + " bonus!";
          melding("🔥 " + this.goedOpRij + " goed op rij! +" + BONUS_DRIE_OP_RIJ);
        }
      } else this.goedOpRij = 0;

      Geluid.goed();
      this.nr++;
      this.bewaarStand();
      kop();
      this.feedback(true, kies(LOF), "+" + punten + " punten" + extra);
      return;
    }

    this.poging++;
    if (this.poging === 1) {
      Geluid.fout();
      Logboek.eersteFout(vlak, antwoord);
      if (q.herstel) q.herstel(vlak);
      this.feedbackBalk(false, kies(BIJNA), "", false);
      return;
    }
    this.bezig = true;
    this.goedOpRij = 0;
    Voortgang.noteer(this.doel, false);
    Voortgang.pasNiveauAan(this.doel, false);
    this.resultaten[this.nr] = 0;
    Geluid.fout();
    if (q.toon) q.toon(vlak);
    Logboek.tweedeFout(vlak, antwoord, q.uitleg, q);
    this.nr++;
    this.bewaarStand();
    kop();
    this.feedback(false, "Kijk maar:", q.uitleg || "");
  },

  /* onderbalk met alleen een melding (tweede kans) */
  feedbackBalk(goed, tekst, extra, metKnop) {
    onderbalk.className = goed ? "feedback goed" : "feedback fout";
    const oud = onderbalk.querySelector(".keypad");
    onderbalk.innerHTML = "";
    onderbalk.appendChild(el("div", { class: "boodschap" }, [
      el("span", { class: "ic", tekst: goed ? "🎉" : "🤔" }),
      el("span", { html: "<b>" + tekst + "</b>" + (extra ? ' <span class="normaal">' + extra + "</span>" : "") })
    ]));
    if (metKnop === false) {
      /* tweede poging: het cijferpad en de Klaar-knop komen terug */
      if (oud) onderbalk.appendChild(oud);
      onderbalk.appendChild(el("button", {
        class: "knop groot", id: "klaarknop", type: "button", tekst: "Klaar!",
        onclick: () => this.inleveren()
      }));
    }
    return onderbalk;
  },

  /* onderbalk met een Verder-knop (de vraag is klaar) */
  feedback(goed, tekst, extra) {
    this.feedbackBalk(goed, tekst, extra, true);
    if (this.werkvlak) this.werkvlak.style.pointerEvents = "none";
    const kn = el("button", {
      class: "knop groot" + (goed ? " groen" : ""), type: "button",
      tekst: this.nr >= VRAGEN_PER_RONDE ? "Klaar met de ronde →" : "Verder →",
      onclick: () => this.volgende()
    });
    onderbalk.appendChild(kn);
    kn.focus();
  },

  einde() {
    this.actief = false;
    const goed = this.resultaten.filter(r => r === 2).length;
    const half = this.resultaten.filter(r => r === 1).length;
    Voortgang.sluitRonde();
    const nieuw = Voortgang.nieuweStickers();
    if (nieuw.length) Geluid.feest(); else Geluid.goed();

    scherm.innerHTML = "";
    onderbalk.innerHTML = "";
    onderbalk.className = "";

    const links = el("div", { class: "startlinks" });
    links.appendChild(poesjeOfPlaatje([kies(EIGEN_PLAATJES.beloningen), EIGEN_PLAATJES.mascotte], 120));
    links.appendChild(el("h2", {
      tekst: goed >= 9 ? "Fantastisch!" : goed >= 7 ? "Goed gedaan!" : goed >= 4 ? "Lekker geoefend!" : "Goed geprobeerd!"
    }));
    links.appendChild(el("div", { class: "grootgetal", html: "+" + this.puntenRonde }));
    links.appendChild(el("div", { class: "klein", tekst: "punten deze ronde" }));

    const rechts = el("div", { class: "startrechts" });
    const stippen = el("div", { class: "stippen groot" });
    this.resultaten.forEach(r => stippen.appendChild(el("span", {
      class: "stip " + (r === 2 ? "goed" : r === 1 ? "half" : "fout")
    })));
    rechts.appendChild(stippen);
    rechts.appendChild(el("div", { class: "klein", tekst: goed + " in één keer goed, " + half + " bij de tweede poging" }));
    rechts.appendChild(el("div", { class: "rangregel", html: "<b>" + Voortgang.rang() + "</b> · niveau " + Voortgang.niveau() }));
    const balk = el("div", { class: "balk" });
    balk.appendChild(el("i", { stijl: "width:" + (Voortgang.deelVanNiveau() * 100) + "%" }));
    rechts.appendChild(balk);
    rechts.appendChild(el("div", { class: "klein", tekst: "⭐ " + Voortgang.punten + " punten in totaal" }));

    if (nieuw.length) {
      const rij = el("div", { class: "nieuwesticker" });
      rij.appendChild(el("div", { class: "klein", tekst: nieuw.length === 1 ? "Nieuwe sticker!" : "Nieuwe stickers!" }));
      const bollen = el("div", { class: "stickerrij" });
      nieuw.forEach(i => {
        const b = stickerBol(i, true, 58);
        b.classList.add("popt");
        bollen.appendChild(b);
      });
      rij.appendChild(bollen);
      rechts.appendChild(rij);
    } else {
      rechts.appendChild(el("div", {
        class: "klein", tekst: "Nog " + Voortgang.puntenTotVolgendeSticker() + " punten tot de volgende sticker 🎁"
      }));
    }

    scherm.appendChild(el("div", { class: "start" }, [links, rechts]));
    onderbalk.appendChild(el("button", {
      class: "knop groot groen", type: "button", tekst: "▶ Nog een ronde",
      onclick: () => this.begin(false, "blok3")
    }));
    onderbalk.appendChild(el("button", { class: "knop stil", type: "button", tekst: "🏠 Naar het begin", onclick: toonStart }));
    kop();
  }
};

/* =========================================================================
   Knoppen en toetsenbord
   ========================================================================= */
document.getElementById("huisknop").addEventListener("click", () => { losmaken(); toonStart(); });
document.getElementById("geluidknop").addEventListener("click", () => {
  Voortgang.geluid = !Voortgang.geluid; kop(); Geluid.klik();
});

/* Op de tablet blijft dit ongebruikt; met een echt toetsenbord werkt het mee. */
document.addEventListener("keydown", e => {
  if (e.defaultPrevented) return;
  if (/^[0-9]$/.test(e.key)) { if (actiefVak()) { tikCijfer(e.key); e.preventDefault(); } return; }
  if (e.key === "Backspace") { const i = actiefVak(); if (i) { i.value = i.value.slice(0, -1); e.preventDefault(); } return; }
  if (e.key !== "Enter") return;
  if (document.activeElement && document.activeElement.tagName === "BUTTON") return;
  const leeg = volgendLeegVak();
  if (leeg) { zetActief(leeg); e.preventDefault(); return; }
  const kl = document.getElementById("klaarknop");
  if (kl) { e.preventDefault(); kl.click(); }
});

/* geluid mag op een tablet pas aan na de eerste aanraking */
document.addEventListener("pointerdown", () => Geluid.klik(), { once: true });

document.getElementById("kopmascotte").appendChild(poesjeOfPlaatje(EIGEN_PLAATJES.mascotte, 46));
toonStart();

/* offline blijven werken (alleen als de app vanaf een server draait) */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
