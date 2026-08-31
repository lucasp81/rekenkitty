/* =========================================================================
   voortgang.js - punten, niveaus, stickers en de dagreeks

   Alles wordt na elke vraag bewaard in de browser (localStorage). Ververst ze
   per ongeluk de pagina, dan gaat er niets verloren: de ronde gaat verder waar
   ze gebleven was.
   ========================================================================= */
"use strict";

/* De stickers die je kunt verzamelen, in de volgorde waarin ze vrijkomen. */
const STICKERS = [
  { emoji: "🎀", naam: "Strikje", kleur: "#ffd6e6" },
  { emoji: "💗", naam: "Hartje", kleur: "#ffdde8" },
  { emoji: "🧁", naam: "Cupcake", kleur: "#ffe6cc" },
  { emoji: "⭐", naam: "Sterretje", kleur: "#fff2c2" },
  { emoji: "🌸", naam: "Bloem", kleur: "#ffe0ef" },
  { emoji: "🍦", naam: "IJsje", kleur: "#e3f3ff" },
  { emoji: "🌈", naam: "Regenboog", kleur: "#e8f7e4" },
  { emoji: "🎈", naam: "Ballon", kleur: "#ffe1e1" },
  { emoji: "🐾", naam: "Pootje", kleur: "#f0e6ff" },
  { emoji: "🍓", naam: "Aardbei", kleur: "#ffdede" },
  { emoji: "👑", naam: "Kroontje", kleur: "#fff0bf" },
  { emoji: "🎂", naam: "Taart", kleur: "#ffe7f3" },
  { emoji: "🍒", naam: "Kersjes", kleur: "#ffdfe4" },
  { emoji: "🦋", naam: "Vlinder", kleur: "#e2f0ff" },
  { emoji: "🐱", naam: "Poesje", kleur: "#ffeaf2" },
  { emoji: "🌟", naam: "Superster", kleur: "#fff3cf" }
];
const PUNTEN_PER_STICKER = 60;

/* Hoe ze heet als ze weer een niveau hoger komt. */
const RANGEN = ["Rekenpoesje", "Rekenvriendje", "Rekenster", "Rekenheld",
                "Rekenkampioen", "Rekenprinses", "Rekenkoningin", "Rekenlegende"];
const PUNTEN_PER_NIVEAU = 100;

/* Wat een goed antwoord oplevert. */
const PUNTEN_EERSTE_KEER = 10;
const PUNTEN_TWEEDE_KEER = 5;
const BONUS_DRIE_OP_RIJ = 10;
const BONUS_NIEUWE_DAG = 20;

const Voortgang = (() => {
  const SLEUTEL = "rekenkitty.v1";
  const leeg = {
    punten: 0,
    stickers: 0,          /* hoeveel stickers er vrijgespeeld zijn */
    dagen: 0,
    laatsteDag: null,     /* "2026-08-31" */
    rondes: 0,
    niveaus: {},          /* per lesdoel 1, 2 of 3 */
    opRij: {},            /* per lesdoel: hoe vaak achter elkaar in één keer goed */
    stats: {},            /* per lesdoel {goed, totaal} */
    ronde: null,          /* de ronde waar ze nu mee bezig is */
    geluid: true
  };
  let d = JSON.parse(JSON.stringify(leeg));

  try {
    const rauw = localStorage.getItem(SLEUTEL);
    if (rauw) d = Object.assign(d, JSON.parse(rauw));
  } catch (e) { /* geen opslag beschikbaar: dan onthoudt hij het alleen deze sessie */ }

  function bewaar() {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(d)); } catch (e) {}
  }
  function vandaag() {
    const t = new Date();
    return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  }
  function gisteren() {
    const t = new Date(Date.now() - 864e5);
    return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  }

  return {
    get alles() { return d; },
    get punten() { return d.punten; },
    get stickers() { return d.stickers; },
    get dagen() { return d.dagen; },
    get rondes() { return d.rondes; },
    get ronde() { return d.ronde; },
    get geluid() { return d.geluid; },
    set geluid(v) { d.geluid = !!v; bewaar(); },

    /* ---------- punten en niveau ---------- */
    telPunten(n) { d.punten += n; bewaar(); return d.punten; },
    niveau() { return Math.floor(d.punten / PUNTEN_PER_NIVEAU) + 1; },
    rang() { return RANGEN[Math.min(this.niveau() - 1, RANGEN.length - 1)]; },
    naarVolgend() { return PUNTEN_PER_NIVEAU - (d.punten % PUNTEN_PER_NIVEAU); },
    deelVanNiveau() { return (d.punten % PUNTEN_PER_NIVEAU) / PUNTEN_PER_NIVEAU; },

    /* ---------- stickers ---------- */
    verdiend() { return Math.min(STICKERS.length, Math.floor(d.punten / PUNTEN_PER_STICKER)); },
    /* Geeft de stickers terug die er sinds de vorige keer bij gekomen zijn. */
    nieuweStickers() {
      const nu = this.verdiend();
      const nieuw = [];
      for (let i = d.stickers; i < nu; i++) nieuw.push(i);
      if (nieuw.length) { d.stickers = nu; bewaar(); }
      return nieuw;
    },
    puntenTotVolgendeSticker() {
      if (this.verdiend() >= STICKERS.length) return 0;
      return (this.verdiend() + 1) * PUNTEN_PER_STICKER - d.punten;
    },

    /* ---------- dagreeks ---------- */
    /* Geeft true als dit de eerste ronde van vandaag is. */
    nieuweDag() {
      const nu = vandaag();
      if (d.laatsteDag === nu) return false;
      d.dagen = (d.laatsteDag === gisteren()) ? d.dagen + 1 : 1;
      d.laatsteDag = nu;
      bewaar();
      return true;
    },

    /* ---------- per lesdoel ---------- */
    niveauVan(doel) { return d.niveaus[doel] || 1; },
    zetNiveauVan(doel, n) { d.niveaus[doel] = Math.max(1, Math.min(3, n)); bewaar(); },
    /* Twee keer achter elkaar in één keer goed? Dan wordt dit lesdoel moeilijker.
       Een fout maakt het weer makkelijker, zodat het altijd net te doen blijft. */
    pasNiveauAan(doel, eersteKeerGoed) {
      if (!d.opRij) d.opRij = {};
      if (eersteKeerGoed) {
        d.opRij[doel] = (d.opRij[doel] || 0) + 1;
        if (d.opRij[doel] >= 2) { d.opRij[doel] = 0; this.zetNiveauVan(doel, this.niveauVan(doel) + 1); }
      } else {
        d.opRij[doel] = 0;
        this.zetNiveauVan(doel, this.niveauVan(doel) - 1);
      }
      bewaar();
    },
    noteer(doel, goed) {
      const s = d.stats[doel] || (d.stats[doel] = { goed: 0, totaal: 0 });
      s.totaal++;
      if (goed) s.goed++;
      bewaar();
    },
    statsVan(doel) { return d.stats[doel] || { goed: 0, totaal: 0 }; },

    /* ---------- de lopende ronde ---------- */
    bewaarRonde(ronde) { d.ronde = ronde; bewaar(); },
    sluitRonde() { d.ronde = null; d.rondes++; bewaar(); },
    vergeetRonde() { d.ronde = null; bewaar(); },

    wisAlles() { d = JSON.parse(JSON.stringify(leeg)); bewaar(); }
  };
})();
