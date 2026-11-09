/* =========================================================================
   logboek.js - wat ze precies gedaan heeft, voor de ouderhoek en het rapport

   Per vraag: wanneer, welk lesdoel en niveau, de opdracht, wat ze bij elke
   poging antwoordde, het goede antwoord en of het in één keer goed was, bij de
   tweede poging, of niet. Bij een fout wordt ook een kiekje van de vraag
   bewaard zoals zij hem achterliet, zodat je ook bij sleep- en tikopdrachten
   (geld, blokken, spiegelen) kunt zien wat ze gedaan heeft.

   Alles staat in de browser van het apparaat, los van de punten. Het logboek
   bewaart de laatste MAX_REGELS vragen; kiekjes alleen bij de laatste
   MAX_KIEKJES fouten, omdat ze meer ruimte innemen.
   ========================================================================= */
"use strict";

const Logboek = (() => {
  const SLEUTEL = "rekenkitty.logboek.v1";
  const MAX_REGELS = 600;
  const MAX_KIEKJES = 60;

  /* een regel: { t: tijd, rid: ronde, d: lesdoel, n: niveau, o: opdracht,
                  a: [antwoord per poging], g: goede antwoord, r: 2|1|0,
                  u: uitleg, k: [{ l: label, h: html }] } */
  let regels = [];
  try {
    const rauw = localStorage.getItem(SLEUTEL);
    if (rauw) regels = JSON.parse(rauw) || [];
  } catch (e) { regels = []; }

  let huidig = null;

  function snoei() {
    if (regels.length > MAX_REGELS) regels.splice(0, regels.length - MAX_REGELS);
    let n = 0;
    for (let i = regels.length - 1; i >= 0; i--) {
      if (regels[i].k) { n++; if (n > MAX_KIEKJES) delete regels[i].k; }
    }
  }
  function bewaar() {
    snoei();
    /* Is de opslag vol, dan eerst de oudste kiekjes weg en daarna de oudste regels. */
    for (let keer = 0; keer < 200; keer++) {
      try { localStorage.setItem(SLEUTEL, JSON.stringify(regels)); return; }
      catch (e) {
        const i = regels.findIndex(r => r.k);
        if (i >= 0) delete regels[i].k;
        else if (regels.length > 1) regels.shift();
        else return;
      }
    }
  }

  function platteTekst(html) {
    const d = document.createElement("div");
    d.innerHTML = html || "";
    return d.textContent.replace(/\s+/g, " ").trim();
  }
  /* tekst uit een knop, ook uit de tekstjes in een getekend plaatje */
  function tekstVan(node) {
    if (node.hasAttribute("data-naam")) return node.getAttribute("data-naam");
    const stukjes = [];
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const s = w.currentNode.nodeValue.trim(); if (s) stukjes.push(s); }
    /* een plaatje vol losse tekstjes (zoals een wijzerplaat) zegt in woorden niets */
    return stukjes.length > 4 ? "" : stukjes.join(" ");
  }

  /* Wat staat er nu ingevuld of gekozen? Bij sleep- en tikopdrachten valt dat
     niet in een paar woorden te zeggen; dan null, en dan spreekt het kiekje. */
  function leesAntwoord(vlak, vraag) {
    if (vraag && vraag.antwoordTekst) return vraag.antwoordTekst();
    const vakjes = [...vlak.querySelectorAll(".num")];
    if (vakjes.length) return vakjes.map(i => i.value.trim() === "" ? "–" : i.value.trim()).join(" / ");
    const knoppen = [...vlak.querySelectorAll(".keuze")];
    const gekozen = knoppen.findIndex(k => k.hasAttribute("data-gekozen"));
    if (gekozen >= 0) return tekstVan(knoppen[gekozen]) || "plaatje " + (gekozen + 1);
    return null;
  }
  /* Na het tonen van het goede antwoord: wat is goed? */
  function leesGoede(vlak, vraag) {
    if (vraag && vraag.antwoordTekst) return vraag.antwoordTekst();
    const vakjes = [...vlak.querySelectorAll(".num")];
    if (vakjes.length) return vakjes.map(i => i.value.trim()).join(" / ");
    const knoppen = [...vlak.querySelectorAll(".keuze")];
    const goed = knoppen.findIndex(k => k.classList.contains("goedgekozen"));
    if (goed >= 0) return tekstVan(knoppen[goed]) || "plaatje " + (goed + 1);
    return null;
  }

  function kiekje(vlak, label) {
    try {
      const c = vlak.cloneNode(true);
      const orig = vlak.querySelectorAll("input"), kopie = c.querySelectorAll("input");
      kopie.forEach((i, k) => i.setAttribute("value", orig[k].value));
      c.querySelectorAll("[id]").forEach(e => e.removeAttribute("id"));
      c.querySelectorAll(".actief").forEach(e => e.classList.remove("actief"));
      return { l: label, h: c.innerHTML };
    } catch (e) { return null; }
  }

  return {
    /* ---------- tijdens de ronde ---------- */
    nieuweVraag(doel, niveau, vraag, rid) {
      huidig = { t: Date.now(), rid, d: doel, n: niveau, o: platteTekst(vraag.opdracht), a: [], g: null, r: null };
    },
    leesAntwoord,
    /* in één keer of bij de tweede poging goed */
    goed(antwoord, eersteKeer) {
      if (!huidig) return;
      huidig.a.push(antwoord);
      huidig.r = eersteKeer ? 2 : 1;
      huidig.g = antwoord;
      regels.push(huidig); huidig = null; bewaar();
    },
    /* eerste poging fout: aanroepen vóórdat de vraag hersteld wordt */
    eersteFout(vlak, antwoord) {
      if (!huidig) return;
      huidig.a.push(antwoord);
      const k = kiekje(vlak, "Eerste poging");
      huidig.k = k ? [k] : [];
    },
    /* tweede poging fout: aanroepen nadat het goede antwoord getoond is */
    tweedeFout(vlak, antwoord, uitleg, vraag) {
      if (!huidig) return;
      huidig.a.push(antwoord);
      huidig.r = 0;
      huidig.g = leesGoede(vlak, vraag);
      huidig.u = platteTekst(uitleg);
      const k = kiekje(vlak, "Na de tweede poging, met het goede antwoord");
      huidig.k = (huidig.k || []).concat(k ? [k] : []);
      regels.push(huidig); huidig = null; bewaar();
    },
    /* goed bij de tweede poging: de uitleg erbij voor het rapport */
    zetUitleg(uitleg) { if (huidig) huidig.u = platteTekst(uitleg); },

    /* ---------- voor de ouderhoek ---------- */
    sinds(tijd) { return regels.filter(r => r.t >= tijd); },
    get aantal() { return regels.length; },
    get eerste() { return regels.length ? regels[0].t : null; },
    wis() { regels = []; huidig = null; bewaar(); }
  };
})();
