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
  { emoji: "🌟", naam: "Superster", kleur: "#fff3cf" },
  /* erbij gekomen in blok 2 */
  { emoji: "🦄", naam: "Eenhoorn", kleur: "#f3e6ff" },
  { emoji: "🌻", naam: "Zonnebloem", kleur: "#fff4c7" },
  { emoji: "🍩", naam: "Donut", kleur: "#ffe3ef" },
  { emoji: "🐞", naam: "Lieveheersbeestje", kleur: "#ffe0e0" },
  { emoji: "🍭", naam: "Lolly", kleur: "#ffe6f5" },
  { emoji: "🐬", naam: "Dolfijn", kleur: "#dff1ff" },
  { emoji: "🌙", naam: "Maantje", kleur: "#fff6d6" },
  { emoji: "🍉", naam: "Watermeloen", kleur: "#e4f7e4" },
  { emoji: "🐰", naam: "Konijntje", kleur: "#f4ecf7" },
  { emoji: "🎠", naam: "Draaimolen", kleur: "#ffe8e0" },
  { emoji: "🐣", naam: "Kuikentje", kleur: "#fff5cc" },
  { emoji: "🍪", naam: "Koekje", kleur: "#f7ead9" },
  { emoji: "🐼", naam: "Panda", kleur: "#eeeeee" },
  { emoji: "🌺", naam: "Hibiscus", kleur: "#ffe0e8" },
  { emoji: "🎪", naam: "Circus", kleur: "#ffe5e5" },
  { emoji: "💎", naam: "Diamant", kleur: "#e0f4ff" },
  /* erbij gekomen in blok 3 */
  { emoji: "🐙", naam: "Octopus", kleur: "#ffe2ec" },
  { emoji: "🍀", naam: "Klavertje", kleur: "#e3f6e3" },
  { emoji: "🎃", naam: "Pompoen", kleur: "#ffe9d2" },
  { emoji: "🦊", naam: "Vosje", kleur: "#ffe8d9" },
  { emoji: "🧸", naam: "Beertje", kleur: "#f6eadb" },
  { emoji: "🌷", naam: "Tulp", kleur: "#ffe0ea" },
  { emoji: "🐢", naam: "Schildpad", kleur: "#e3f5e6" },
  { emoji: "🍰", naam: "Taartje", kleur: "#fff0e6" },
  { emoji: "🪁", naam: "Vlieger", kleur: "#e3efff" },
  { emoji: "🐧", naam: "Pinguïn", kleur: "#e8eef5" },
  { emoji: "🍄", naam: "Paddenstoel", kleur: "#ffe3e3" },
  { emoji: "🦉", naam: "Uiltje", kleur: "#f2eadf" },
  { emoji: "🎻", naam: "Viool", kleur: "#f7e6d8" },
  { emoji: "🐳", naam: "Walvis", kleur: "#dff0ff" },
  { emoji: "🌠", naam: "Vallende ster", kleur: "#ecebff" },
  { emoji: "🏆", naam: "Beker", kleur: "#fff2c2" }
];
const PUNTEN_PER_STICKER = 60;

/* Hoe ze heet als ze weer een niveau hoger komt. */
const RANGEN = ["Rekenpoesje", "Rekenvriendje", "Rekenster", "Rekenheld",
                "Rekenkampioen", "Rekenprinses", "Rekenkoningin", "Rekenlegende",
                "Rekentovenaar", "Rekenfee", "Rekenkeizerin", "Rekenwonder",
                "Rekenregenboog", "Rekensuperster", "Rekengenie", "Rekenlegende met kroon"];
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
    stickerDrempel: PUNTEN_PER_STICKER,   /* bij zoveel punten komt de volgende sticker vrij */
    dagen: 0,
    laatsteDag: null,     /* "2026-08-31" */
    rondes: 0,
    niveaus: {},          /* per lesdoel 1, 2 of 3 */
    opRij: {},            /* per lesdoel: hoe vaak achter elkaar in één keer goed */
    stats: {},            /* per lesdoel {goed, totaal} */
    ronde: null,          /* de ronde waar ze nu mee bezig is */
    nogTeDoen: {},        /* per blok: lesdoelen die in deze cyclus nog niet aan de beurt waren */
    blok3Start: 0,        /* aantal afgeronde rondes toen blok 3 erbij kwam */
    blok3Extra: 0,        /* zoveel lesdoelen van blok 3 heeft papa/mama al eerder vrijgegeven */
    stickersBlok3: true,  /* de 16 stickers van blok 3 zijn verrekend */
    geluid: true
  };
  let d = JSON.parse(JSON.stringify(leeg));

  try {
    const rauw = localStorage.getItem(SLEUTEL);
    if (rauw) {
      const oud = JSON.parse(rauw);
      d = Object.assign(d, oud);
      /* Opslag van vóór blok 2 kende nog geen drempel. Wie toen al alle 16 stickers had,
         verdient de nieuwe stickers vanaf nu, elke 60 punten één, in plaats van allemaal tegelijk. */
      if (oud.stickerDrempel === undefined)
        d.stickerDrempel = d.stickers < 16 ? (d.stickers + 1) * PUNTEN_PER_STICKER
          : (Math.floor(d.punten / PUNTEN_PER_STICKER) + 1) * PUNTEN_PER_STICKER;
      /* Blok 3 telt vanaf de eerste keer dat deze versie opent. */
      if (oud.blok3Start === undefined) d.blok3Start = d.rondes;
      /* Had ze al alle 32 stickers van blok 1 en 2, dan verdient ze de nieuwe vanaf nu,
         elke 60 punten één, in plaats van allemaal tegelijk. */
      if (oud.stickersBlok3 === undefined && d.stickers >= 32)
        d.stickerDrempel = Math.max(d.stickerDrempel, (Math.floor(d.punten / PUNTEN_PER_STICKER) + 1) * PUNTEN_PER_STICKER);
      d.stickersBlok3 = true;
    }
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
    verdiend() { return Math.min(STICKERS.length, d.stickers); },
    /* Aan het eind van een ronde: geeft de stickers terug die er nu bij komen. */
    nieuweStickers() {
      const nieuw = [];
      while (d.stickers < STICKERS.length && d.punten >= d.stickerDrempel) {
        nieuw.push(d.stickers);
        d.stickers++;
        d.stickerDrempel += PUNTEN_PER_STICKER;
      }
      if (nieuw.length) bewaar();
      return nieuw;
    },
    puntenTotVolgendeSticker() {
      if (this.verdiend() >= STICKERS.length) return 0;
      return Math.max(0, d.stickerDrempel - d.punten);
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

    /* Kiest n lesdoelen uit ids, eerst de lesdoelen die nog niet aan de beurt waren.
       Zijn ze allemaal geweest, dan begint er een nieuwe cyclus. */
    kiesUit(sleutel, ids, n) {
      if (!d.nogTeDoen) d.nogTeDoen = {};
      let pool = (d.nogTeDoen[sleutel] || []).filter(id => ids.includes(id));
      let gekozen = schud(pool).slice(0, n);
      pool = pool.filter(id => !gekozen.includes(id));
      if (gekozen.length < n) {
        const erbij = schud(ids.filter(id => !gekozen.includes(id))).slice(0, n - gekozen.length);
        gekozen = gekozen.concat(erbij);
        pool = ids.filter(id => !erbij.includes(id));
      }
      d.nogTeDoen[sleutel] = pool;
      bewaar();
      return gekozen;
    },

    /* ---------- blok 3 komt stap voor stap vrij ---------- */
    blok3Rondes() { return Math.max(0, d.rondes - (d.blok3Start || 0)); },
    get blok3Extra() { return d.blok3Extra || 0; },
    geefBlok3Vrij() { d.blok3Extra = (d.blok3Extra || 0) + 1; bewaar(); },

    /* ---------- de lopende ronde ---------- */
    bewaarRonde(ronde) { d.ronde = ronde; bewaar(); },
    sluitRonde() { d.ronde = null; d.rondes++; bewaar(); },
    vergeetRonde() { d.ronde = null; bewaar(); },

    wisAlles() { d = JSON.parse(JSON.stringify(leeg)); bewaar(); }
  };
})();
