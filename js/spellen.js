/* =========================================================================
   spellen.js - een vraaggenerator per lesdoel van Alles Telt Q, groep 4, blok 1
   ========================================================================= */
"use strict";

/* Rij met hokjes en gaten: 12, 13, __, 15, __ */
function reeksVraag(getallen, gaten, opdracht, uitleg) {
  const antw = gaten.map(i => getallen[i]);
  return invulVraag(opdracht, vlak => {
    const rij = el("div", { class: "rij" });
    getallen.forEach((g, i) => {
      if (gaten.indexOf(i) >= 0) rij.appendChild(invoerVak(78));
      else rij.appendChild(el("div", { class: "hokje", tekst: String(g) }));
    });
    vlak.appendChild(rij);
    vlak.appendChild(cijferpad());
  }, antw, uitleg);
}
/* Dezelfde rij, maar met slepen */
function sleepReeksVraag(getallen, gaten, opdracht, uitleg) {
  const antw = gaten.map(i => getallen[i]);
  const gezet = {};
  return {
    opdracht, uitleg,
    bouw(vlak) {
      const rij = el("div", { class: "rij" });
      gaten.forEach((g, k) => { gezet[k] = null; });
      getallen.forEach((g, i) => {
        const k = gaten.indexOf(i);
        if (k >= 0) {
          const gat = el("div", { class: "hokje", stijl: "border:3px dashed #9db4c8;background:#fff;min-width:82px" });
          dropzone(gat, (bron, gegevens) => {
            gat.textContent = gegevens; gat.style.background = "#e8f3ff"; gezet[k] = gegevens;
            Geluid.klik();
          });
          gat.addEventListener("click", () => {
            if (netGedropt) return;   /* er is net iets in gelegd */
            gat.textContent = ""; gat.style.background = "#fff"; gezet[k] = null;
          });
          rij.appendChild(gat);
        } else rij.appendChild(el("div", { class: "hokje", tekst: String(g) }));
      });
      vlak.appendChild(rij);
      vlak.appendChild(el("div", { class: "label", tekst: "Tik een getal aan en daarna een leeg vakje, of sleep het. Tik een vol vakje aan om het weer leeg te maken." }));
      const voorraad = el("div", { class: "voorraad" });
      const stoorders = [];
      while (stoorders.length < 2) {
        const s = kies(antw) + kies([-1, 1, 2, -2, 5, -5]);
        if (s > 0 && antw.indexOf(s) < 0 && stoorders.indexOf(s) < 0) stoorders.push(s);
      }
      schud(antw.concat(stoorders)).forEach(n => {
        const t = el("div", { class: "hokje", tekst: String(n), stijl: "background:#ffe9a8;cursor:grab" });
        sleepbaar(t, n, { kopie: true });
        voorraad.appendChild(t);
      });
      vlak.appendChild(voorraad);
    },
    check() { return antw.every((a, k) => gezet[k] === a); },
    toon(vlak) {
      const gaten2 = [...vlak.querySelectorAll(".hokje")].filter(h => h.classList.contains("dropzone"));
      gaten2.forEach((g, k) => {
        g.textContent = antw[k]; g.style.background = "#eafaef"; g.style.borderColor = "#15a24a";
        gezet[k] = antw[k];
      });
    }
  };
}

const SPELLEN = {};

/* =========================================================================
   1. Tellen tot en met 100
   ========================================================================= */
SPELLEN.tellen = {
  titel: "Tellen tot 100", emoji: "🔢", kleur: "#ff4d87",
  doel: "Ik tel tot en met 100",
  maak(niv) {
    const soorten = niv === 1 ? ["buren", "rij", "veld"] : niv === 2 ? ["veld", "rij", "buren", "rij"] : ["terug", "veld", "terug", "buren"];
    const soort = kies(soorten);
    const max = niv === 1 ? 40 : 100;

    if (soort === "buren") {
      const g = niv === 3 ? kies([20, 30, 40, 50, 60, 70, 80, 90]) + kies([0, 1]) : rnd(2, max - 1);
      return reeksVraag([g - 1, g, g + 1], [0, 2],
        "Welk getal komt er vóór " + g + " en welk getal komt erna?",
        "Voor " + g + " komt " + (g - 1) + ", na " + g + " komt " + (g + 1) + ".");
    }
    if (soort === "rij") {
      const start = rnd(niv === 1 ? 1 : 30, max - 6);
      const rij = reeks(6, i => start + i);
      return reeksVraag(rij, schud([2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b),
        "Tel verder. Vul de lege vakjes in.", "Je telt steeds 1 verder.");
    }
    if (soort === "terug") {
      const start = rnd(30, 100);
      const rij = reeks(6, i => start - i);
      return reeksVraag(rij, schud([1, 2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b),
        "Tel terug. Vul de lege vakjes in.", "Je telt steeds 1 terug.");
    }
    /* honderdveld-strook */
    const rijen = niv === 1 ? 2 : 3;
    const startTiental = rnd(0, 10 - rijen);
    const eerste = startTiental * 10 + 1;
    const totaal = rijen * 10;
    const gaten = schud(reeks(totaal)).slice(0, niv === 1 ? 3 : 4).sort((a, b) => a - b);
    const antw = gaten.map(i => eerste + i);
    return invulVraag("Dit is een stukje van het honderdveld. Welke getallen missen er?", vlak => {
      const veld = el("div", { class: "veld" });
      for (let i = 0; i < totaal; i++) {
        const getal = eerste + i;
        const cel = el("div", { class: "cel" + (getal % 10 === 0 ? " tien" : "") });
        if (gaten.indexOf(i) >= 0) cel.appendChild(invoerVak());
        else cel.textContent = getal;
        veld.appendChild(cel);
      }
      vlak.appendChild(veld);
      vlak.appendChild(el("div", { class: "label", tekst: "Tip: elke rij gaat 1 verder, elke stap naar beneden is 10 meer." }));
      vlak.appendChild(cijferpad());
    }, antw, "Kijk naar het getal links ervan en tel 1 verder.");
  }
};

/* =========================================================================
   2. Centimeter meten
   ========================================================================= */
function liniaalPlaatje(cmMax, obj, opties) {
  opties = opties || {};
  const sx = Math.min(34, 700 / cmMax), pad = 26, W = cmMax * sx + 2 * pad, H = 172, yL = 92;
  let s = "";
  if (obj) {
    const x1 = pad + obj.van * sx, x2 = pad + obj.tot * sx;
    s += '<rect id="voorwerp" x="' + x1 + '" y="' + (yL - 50) + '" width="' + (x2 - x1) + '" height="32" rx="14" fill="' +
      (obj.kleur || "#e0324f") + '" stroke="rgba(0,0,0,.18)" stroke-width="2"/>';
    if (obj.naam) s += '<text x="' + ((x1 + x2) / 2) + '" y="' + (yL - 60) + '" text-anchor="middle" font-size="17" font-family="Trebuchet MS" fill="#5b7185">' + obj.naam + "</text>";
  }
  s += '<rect x="' + (pad - 16) + '" y="' + yL + '" width="' + (cmMax * sx + 32) + '" height="58" rx="6" fill="#ffe9a8" stroke="#d8b34a" stroke-width="2"/>';
  for (let c = 0; c <= cmMax; c++) {
    const x = pad + c * sx;
    s += '<line x1="' + x + '" y1="' + yL + '" x2="' + x + '" y2="' + (yL + 20) + '" stroke="#7a5c17" stroke-width="2"/>';
    s += '<text x="' + x + '" y="' + (yL + 44) + '" text-anchor="middle" font-size="15" font-family="Trebuchet MS" fill="#7a5c17">' + c + "</text>";
    if (c < cmMax) s += '<line x1="' + (x + sx / 2) + '" y1="' + yL + '" x2="' + (x + sx / 2) + '" y2="' + (yL + 11) + '" stroke="#7a5c17" stroke-width="1.5"/>';
  }
  const node = svg(s, W, H);
  return { node, sx, pad, yL, W };
}

SPELLEN.meten = {
  titel: "Meten met cm", emoji: "📏", kleur: "#ff7a59",
  doel: "Ik leer wat een centimeter is",
  maak(niv) {
    const dingen = [["het lint", "#e0324f"], ["het potlood", "#f4a83c"], ["de rups", "#15a24a"], ["het touwtje", "#8b5cf6"], ["de veer", "#2f7ff0"]];
    const ding = kies(dingen);
    if (niv >= 2 && Math.random() < .4) {
      /* zelf een lengte maken door te slepen */
      const doel = rnd(3, 15);
      let huidig = 1, zetLengte = null;
      return {
        opdracht: "Maak " + ding[0] + " precies <b>" + doel + " cm</b> lang. Tik of sleep op de liniaal.",
        uitleg: "Begin bij 0 en tel de centimeters tot " + doel + ".",
        bouw(vlak) {
          const p = liniaalPlaatje(20, { van: 0, tot: huidig, kleur: ding[1] });
          const teller = el("div", { class: "label", stijl: "font-size:19px;color:#12293d;font-weight:bold" });
          const s = p.node.querySelector("svg");
          const balk = s.querySelector("#voorwerp");
          zetLengte = n => {
            huidig = Math.max(1, Math.min(20, n));
            balk.setAttribute("width", huidig * p.sx);
            teller.textContent = "Nu is " + ding[0] + " " + huidig + " cm lang.";
          };
          const uitEvent = ev => {
            const r = s.getBoundingClientRect();
            const schaal = r.width / p.W;
            const cm = Math.round(((ev.clientX - r.left) / schaal - p.pad) / p.sx);
            if (cm !== huidig) { zetLengte(cm); Geluid.klik(); }
          };
          s.style.touchAction = "none";
          s.style.cursor = "ew-resize";
          s.addEventListener("pointerdown", ev => { s.setPointerCapture(ev.pointerId); s._sleept = true; uitEvent(ev); });
          s.addEventListener("pointermove", ev => { if (s._sleept) uitEvent(ev); });
          s.addEventListener("pointerup", () => { s._sleept = false; });
          s.addEventListener("pointercancel", () => { s._sleept = false; });
          zetLengte(huidig);
          vlak.appendChild(p.node);
          vlak.appendChild(teller);
        },
        check() { return huidig === doel; },
        toon() { if (zetLengte) zetLengte(doel); }
      };
    }
    let van = 0, tot;
    if (niv === 1) tot = rnd(2, 10);
    else if (niv === 2) tot = rnd(6, 18);
    else { van = rnd(1, 6); tot = van + rnd(4, 12); }
    const lengte = tot - van;
    return invulVraag("Hoe lang is " + ding[0] + "?", vlak => {
      vlak.appendChild(liniaalPlaatje(20, { van, tot, kleur: ding[1], naam: ding[0] }).node);
      const rij = el("div", { class: "rij" });
      rij.appendChild(invoerVak());
      rij.appendChild(el("div", { class: "hokje", tekst: "cm", stijl: "background:none;font-size:26px" }));
      vlak.appendChild(rij);
      vlak.appendChild(cijferpad());
    }, [lengte], van === 0 ? "Kijk waar het eindigt op de liniaal." :
      "Het begint bij " + van + " en eindigt bij " + tot + ". " + tot + " − " + van + " = " + lengte + " cm.");
  }
};

/* =========================================================================
   3. Splitsen in tientallen en eenheden
   ========================================================================= */
function mabPlaatje(tientallen, eenheden) {
  const doos = el("div", { class: "rij", stijl: "align-items:flex-end;gap:6px" });
  for (let i = 0; i < tientallen; i++) doos.appendChild(tienstaaf(92));
  if (eenheden) {
    const kolom = el("div", { stijl: "display:flex;flex-wrap:wrap;width:72px;gap:4px;margin-left:10px" });
    for (let i = 0; i < eenheden; i++) kolom.appendChild(losblokje(20));
    doos.appendChild(kolom);
  }
  return doos;
}
SPELLEN.splitsen = {
  titel: "Tientallen en eenheden", emoji: "🧱", kleur: "#f2a03d",
  doel: "Ik leer getallen splitsen in tientallen en eenheden",
  maak(niv) {
    const soort = niv === 1 ? kies(["tellen", "bouwen"]) : kies(["bouwen", "splits", "tellen", "splits"]);
    /* bij het bouwen niet te veel staven, anders wordt het slepen een klus */
    const t = soort === "bouwen" ? rnd(niv === 1 ? 1 : 2, niv === 1 ? 4 : 6) : rnd(niv === 1 ? 1 : 2, niv === 1 ? 5 : 9);
    const e = rnd(1, 9);
    const getal = t * 10 + e;

    if (soort === "tellen") {
      return invulVraag("Hoeveel blokjes zie je? Vul de tientallen en de eenheden in.", vlak => {
        vlak.appendChild(mabPlaatje(t, e));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(el("div", { class: "hokje", tekst: "tientallen en", stijl: "background:none;font-size:20px" }));
        rij.appendChild(invoerVak());
        rij.appendChild(el("div", { class: "hokje", tekst: "eenheden =", stijl: "background:none;font-size:20px" }));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [t, e, getal], t + " staven van 10 is " + t * 10 + ", en " + e + " losse blokjes erbij is " + getal + ".");
    }
    if (soort === "splits") {
      if (Math.random() < .5)
        return invulVraag("Splits het getal <b>" + getal + "</b> in tientallen en eenheden.", vlak => {
          const rij = el("div", { class: "som" });
          rij.appendChild(el("span", { tekst: String(getal) }));
          rij.appendChild(el("span", { tekst: "=" }));
          rij.appendChild(invoerVak());
          rij.appendChild(el("span", { tekst: "+" }));
          rij.appendChild(invoerVak());
          vlak.appendChild(rij);
          vlak.appendChild(cijferpad());
        }, [t * 10, e], getal + " = " + t * 10 + " + " + e + ".");
      return invulVraag("Welk getal hoort hierbij?", vlak => {
        const rij = el("div", { class: "som" });
        rij.appendChild(el("span", { tekst: t * 10 + " + " + e + " =" }));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [getal], t * 10 + " + " + e + " = " + getal + ".");
    }
    /* bouwen met slepen */
    let gt = 0, ge = 0;
    return {
      opdracht: "Maak het getal <b>" + getal + "</b> met blokken. Tik of sleep staven van 10 en losse blokjes naar de mat.",
      uitleg: getal + " = " + t + (t === 1 ? " staaf" : " staven") + " van 10 en " + e + (e === 1 ? " los blokje." : " losse blokjes."),
      bouw(vlak) {
        const mat = el("div", { class: "bak", stijl: "width:100%;max-width:640px;min-height:130px;align-items:flex-end" });
        const teller = el("div", { class: "label", stijl: "font-size:19px;color:#12293d;font-weight:bold" });
        const werkbij = () => {
          teller.textContent = gt + (gt === 1 ? " tiental" : " tientallen") + " en " +
            ge + (ge === 1 ? " eenheid" : " eenheden") + " = " + (gt * 10 + ge);
          teller.style.color = (gt * 10 + ge) === getal ? "#15a24a" : "#12293d";
        };
        dropzone(mat, (bron, soortje) => {
          if (soortje === "t" && gt >= 9) return;
          if (soortje === "e" && ge >= 12) return;
          const stuk = soortje === "t" ? tienstaaf(92) : losblokje(24);
          stuk.style.cursor = "pointer";
          stuk.title = "Tik om weg te halen";
          stuk.addEventListener("click", () => { stuk.remove(); if (soortje === "t") gt--; else ge--; werkbij(); });
          mat.appendChild(stuk);
          if (soortje === "t") gt++; else ge++;
          werkbij(); Geluid.klik();
        });
        vlak.appendChild(el("div", { class: "label", tekst: "↓ hier komen de blokken (tik op een blok om het weg te halen)" }));
        vlak.appendChild(mat);
        vlak.appendChild(teller); werkbij();
        const voorraad = el("div", { class: "voorraad" });
        const a = el("div", { stijl: "text-align:center" });
        const staaf = tienstaaf(92); a.appendChild(staaf);
        a.appendChild(el("div", { class: "label", tekst: "10" }));
        const b = el("div", { stijl: "text-align:center" });
        const blokje = losblokje(24); b.appendChild(blokje);
        b.appendChild(el("div", { class: "label", tekst: "1" }));
        sleepbaar(staaf, "t", { kopie: true, opKlik: () => mat._opDrop(null, "t") });
        sleepbaar(blokje, "e", { kopie: true, opKlik: () => mat._opDrop(null, "e") });
        voorraad.appendChild(a); voorraad.appendChild(b);
        vlak.appendChild(voorraad);
      },
      check() { return gt === t && ge === e; }
    };
  }
};

/* =========================================================================
   4. Tellen met sprongen
   ========================================================================= */
SPELLEN.sprongen = {
  titel: "Sprongen tellen", emoji: "🐰", kleur: "#b06ee6",
  doel: "Ik kan tellen met sprongen",
  maak(niv) {
    const stap = niv === 1 ? kies([10, 5, 2]) : niv === 2 ? kies([2, 5, 10, 5]) : kies([2, 5, 10]);
    const terug = niv === 3 && Math.random() < .45;
    let start;
    if (niv === 1) start = stap === 10 ? kies([0, 10, 20, 30]) : stap === 5 ? kies([0, 5, 10, 15]) : kies([0, 2, 4, 6]);
    else if (niv === 2) start = rnd(1, 9);
    else start = rnd(3, 20);
    if (terug) start = Math.min(98, start + 6 * stap);
    const richting = terug ? -stap : stap;
    const rij = reeks(6, i => start + i * richting).filter(n => n >= 0 && n <= 110);
    while (rij.length < 5) rij.push(rij[rij.length - 1] + richting);
    const gaten = schud(reeks(rij.length).slice(2)).slice(0, 3).sort((a, b) => a - b);
    const tekst = "Tel met sprongen van <b>" + stap + "</b> " + (terug ? "terug" : "vooruit") + ". Vul de lege vakjes in.";
    const uitleg = "Je doet er steeds " + stap + " " + (terug ? "af" : "bij") + ".";
    if (niv >= 2 && Math.random() < .4) return sleepReeksVraag(rij, gaten, tekst.replace("Vul de lege vakjes in.", ""), uitleg);
    return reeksVraag(rij, gaten, tekst, uitleg);
  }
};

/* =========================================================================
   5. Optellen en aftrekken
   ========================================================================= */
SPELLEN.plusmin = {
  titel: "Plus en min", emoji: "➕", kleur: "#e8384f",
  doel: "Ik oefen optellen en aftrekken",
  maak(niv) {
    let a, b, plus = Math.random() < .5, gat = niv >= 2 && Math.random() < .25;
    if (niv === 1) {
      if (plus) { a = rnd(2, 9); b = rnd(1, 10 - a); }
      else { a = rnd(4, 10); b = rnd(1, a - 1); }
    } else if (niv === 2) {
      if (plus) { a = rnd(4, 9); b = rnd(11 - a, 9); }
      else { a = rnd(11, 18); b = rnd(a - 9, 9); }
    } else {
      const soort = kies(["tientallen", "tientallen", "te"]);
      if (soort === "tientallen") {
        if (plus) { a = rnd(1, 6) * 10; b = rnd(1, 9 - a / 10) * 10; }
        else { a = rnd(4, 10) * 10; b = rnd(1, a / 10 - 1) * 10; }
      } else {
        const t = rnd(2, 8) * 10, e = rnd(1, 5);
        if (plus) { a = t + e; b = rnd(1, 9 - e); }
        else { a = t + rnd(4, 9); b = rnd(1, 3); }
      }
    }
    const uitkomst = plus ? a + b : a - b;
    const teken = plus ? "+" : "−";
    const somTekst = a + " " + teken + " " + b + " = " + uitkomst;
    const kleinGenoeg = a <= 20 && uitkomst <= 20 && b <= 20;

    const vraag = gat
      ? invulVraag("Welk getal hoort in het lege vakje?", vlak => {
          const rij = el("div", { class: "som" });
          rij.appendChild(el("span", { tekst: a + " " + teken }));
          rij.appendChild(invoerVak());
          rij.appendChild(el("span", { tekst: "= " + uitkomst }));
          vlak.appendChild(rij);
          vlak.appendChild(cijferpad());
        }, [b], somTekst)
      : invulVraag("Reken uit.", vlak => {
          const rij = el("div", { class: "som" });
          rij.appendChild(el("span", { tekst: a + " " + teken + " " + b + " =" }));
          rij.appendChild(invoerVak());
          vlak.appendChild(rij);
          vlak.appendChild(cijferpad());
        }, [uitkomst], somTekst);

    if (kleinGenoeg) vraag.hulp = () => {
      const d = el("div", { class: "hulpvak" });
      d.appendChild(el("div", { class: "label", tekst: plus ? "Blauw is " + a + ". Er komen " + b + " oranje bij." : "Er zijn " + a + " stippen. Er gaan er " + b + " weg." }));
      d.appendChild(tienvlakken(a, b, !plus));
      return d;
    };
    return vraag;
  }
};

/* =========================================================================
   6. Munten van 5, 10, 20 en 50 cent
   ========================================================================= */
const MUNTEN = [5, 10, 20, 50];
SPELLEN.geld = {
  titel: "Geld en munten", emoji: "🪙", kleur: "#dda200",
  doel: "Ik leer munten van 5, 10, 20 en 50 cent gebruiken",
  maak(niv) {
    const soort = niv === 1 ? kies(["tellen", "tellen", "betalen"]) : kies(["betalen", "tellen", "aanvullen", "betalen"]);

    if (soort === "tellen") {
      const bruikbaar = niv === 1 ? [10, 20, 50] : MUNTEN;
      const aantal = niv === 1 ? rnd(2, 3) : rnd(3, 5);
      let munten = [], som = 0, poging = 0;
      do {
        munten = []; som = 0;
        for (let i = 0; i < aantal; i++) { const m = kies(bruikbaar); munten.push(m); som += m; }
        poging++;
      } while (som > 95 && poging < 40);
      munten.sort((a, b) => b - a);
      return invulVraag("Hoeveel geld is dit samen?", vlak => {
        const rij = el("div", { class: "rij" });
        munten.forEach(m => rij.appendChild(muntje(m, 72)));
        vlak.appendChild(rij);
        const r2 = el("div", { class: "rij" });
        r2.appendChild(invoerVak());
        r2.appendChild(el("div", { class: "hokje", tekst: "cent", stijl: "background:none;font-size:24px" }));
        vlak.appendChild(r2);
        vlak.appendChild(cijferpad());
      }, [som], "Tel de munten bij elkaar op: " + munten.join(" + ") + " = " + som + " cent.");
    }

    if (soort === "aanvullen") {
      const doel = rnd(3, 18) * 5;
      const missend = kies(MUNTEN.filter(m => m <= doel - 5));
      const rest = doel - missend;
      const munten = [];
      let over = rest;
      while (over > 0) { const m = Math.max.apply(null, MUNTEN.filter(x => x <= over)); munten.push(m); over -= m; }
      const opties = schud(MUNTEN.slice());
      return keuzeVraag({
        opdracht: "Je hebt dit geld. Je moet <b>" + doel + " cent</b> betalen. Welke munt heb je er nog bij nodig?",
        uitleg: "Je hebt " + rest + " cent. " + rest + " + " + missend + " = " + doel + " cent.",
        opties, goed: opties.indexOf(missend), plaatje: true,
        tussen: "Kies de munt die er nog bij moet:",
        boven(vlak) {
          const rij = el("div", { class: "rij" });
          munten.forEach(m => rij.appendChild(muntje(m, 62)));
          rij.appendChild(el("div", { class: "hokje", tekst: "= " + rest + " cent", stijl: "background:none;font-size:22px" }));
          vlak.appendChild(rij);
        },
        inhoud(knop, m) { knop.appendChild(muntje(m, 62)); }
      });
    }

    /* precies betalen door munten te slepen */
    const doel = rnd(niv === 1 ? 2 : 3, niv === 1 ? 10 : 19) * 5;
    let inBak = [];
    return {
      opdracht: "Betaal precies <b>" + doel + " cent</b>. Tik of sleep de munten naar de toonbank.",
      uitleg: "Bijvoorbeeld: " + (() => { let o = doel, r = []; MUNTEN.slice().reverse().forEach(m => { while (o >= m) { r.push(m); o -= m; } }); return r.join(" + ") + " = " + doel; })() + " cent.",
      bouw(vlak) {
        const teller = el("div", { class: "label", stijl: "font-size:20px;color:#12293d;font-weight:bold" });
        const bak = el("div", { class: "bak", stijl: "width:100%;max-width:600px" });
        const werkbij = () => {
          const s = inBak.reduce((a, b) => a + b, 0);
          teller.textContent = "In de toonbank: " + s + " cent van de " + doel + " cent";
          teller.style.color = s === doel ? "#15a24a" : "#12293d";
        };
        dropzone(bak, (bron, waarde) => {
          if (inBak.length >= 12) return;
          const m = muntje(waarde, 62);
          m.style.cursor = "pointer"; m.title = "Tik om terug te leggen";
          m.addEventListener("click", () => {
            m.remove();
            const i = inBak.indexOf(waarde); if (i >= 0) inBak.splice(i, 1);
            werkbij();
          });
          bak.appendChild(m); inBak.push(waarde); werkbij(); Geluid.klik();
        });
        vlak.appendChild(el("div", { class: "label", tekst: "↓ toonbank (tik op een munt om hem terug te leggen)" }));
        vlak.appendChild(bak);
        vlak.appendChild(teller); werkbij();
        const voorraad = el("div", { class: "voorraad" });
        MUNTEN.forEach(w => {
          const m = muntje(w, 66);
          sleepbaar(m, w, { kopie: true, opKlik: () => bak._opDrop(null, w) });
          voorraad.appendChild(m);
        });
        vlak.appendChild(voorraad);
      },
      check() { return inBak.reduce((a, b) => a + b, 0) === doel; }
    };
  }
};

/* =========================================================================
   7. Herhaald optellen
   ========================================================================= */
const PLAATJES = ["🍓", "🌸", "🎀", "🧁", "🍰", "🐱", "💗", "🍒"];
function groepjes(n, k, plaatje) {
  const rij = el("div", { class: "rij", stijl: "gap:14px" });
  for (let i = 0; i < n; i++) {
    const g = el("div", {
      stijl: "border:3px solid #cddcea;border-radius:16px;padding:8px;display:grid;" +
        "grid-template-columns:repeat(" + Math.min(k, 5) + ",1fr);gap:2px;background:#fbfdff;font-size:24px;line-height:1.1"
    });
    for (let j = 0; j < k; j++) g.appendChild(el("span", { tekst: plaatje }));
    rij.appendChild(g);
  }
  return rij;
}
SPELLEN.herhaald = {
  titel: "Herhaald optellen", emoji: "🍓", kleur: "#ff6fae",
  doel: "Ik leer herhaald optellen",
  maak(niv) {
    const plaatje = kies(PLAATJES);
    const k = niv === 1 ? kies([2, 5, 10]) : niv === 2 ? kies([2, 3, 4, 5, 10]) : kies([3, 4, 5, 10]);
    const n = niv === 1 ? rnd(2, 4) : niv === 2 ? rnd(3, 5) : rnd(4, 6);
    const totaal = n * k;
    const som = reeks(n, () => k).join(" + ");
    const soort = niv === 1 ? kies(["invullen", "som"]) : kies(["invullen", "som", "welke", "hoeveelgroepjes"]);

    if (soort === "som")
      return invulVraag("Reken uit.", vlak => {
        vlak.appendChild(groepjes(n, k, plaatje));
        const rij = el("div", { class: "som", stijl: "font-size:32px" });
        rij.appendChild(el("span", { tekst: som + " =" }));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [totaal], "Er zijn " + n + " groepjes van " + k + ". " + som + " = " + totaal + ".");

    if (soort === "hoeveelgroepjes")
      return invulVraag("Hoeveel groepjes van " + k + " zitten er in " + totaal + "?", vlak => {
        vlak.appendChild(groepjes(n, k, plaatje));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(el("div", { class: "hokje", tekst: "groepjes van " + k, stijl: "background:none;font-size:22px" }));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [n], som + " = " + totaal + ", dus " + n + " groepjes van " + k + ".");

    if (soort === "welke") {
      const fout1 = reeks(n + 1, () => k).join(" + ");
      const fout2 = reeks(n, () => k + 1).join(" + ");
      const opties = schud([som, fout1, fout2]);
      return keuzeVraag({
        opdracht: "Welke som hoort bij dit plaatje?",
        uitleg: "Er zijn " + n + " groepjes van " + k + ", dus " + som + " = " + totaal + ".",
        opties, goed: opties.indexOf(som),
        boven(vlak) { vlak.appendChild(groepjes(n, k, plaatje)); },
        inhoud(knop, s) { knop.textContent = s; knop.style.fontSize = "22px"; }
      });
    }

    return invulVraag("Vul in wat je ziet.", vlak => {
      vlak.appendChild(groepjes(n, k, plaatje));
      const rij = el("div", { class: "rij" });
      rij.appendChild(invoerVak());
      rij.appendChild(el("div", { class: "hokje", tekst: "groepjes van", stijl: "background:none;font-size:21px" }));
      rij.appendChild(invoerVak());
      rij.appendChild(el("div", { class: "hokje", tekst: "= samen", stijl: "background:none;font-size:21px" }));
      rij.appendChild(invoerVak());
      vlak.appendChild(rij);
      vlak.appendChild(cijferpad());
    }, [n, k, totaal], som + " = " + totaal + ".");
  }
};

/* =========================================================================
   8. Aanzichten
   ========================================================================= */
/* Bouwwerk in "schuine" projectie: breedte naar rechts, diepte naar rechtsboven.
   h[r][c] = hoogte; r = 0 is de rij die het dichtst bij je staat. */
function isoBouwwerk(h) {
  const R = h.length, C = h[0].length;
  const zij = 42, d = 19, d2 = 15;
  const maxH = Math.max.apply(null, h.map(r => Math.max.apply(null, r)));
  const ox = 18, oy = 18 + (R - 1) * d2 + (maxH - 1) * zij + d2;
  const W = 36 + (C - 1) * zij + (R - 1) * d + zij + d;
  const H = oy + zij + 18;
  let s = "";
  /* de grondplaat */
  for (let r = R - 1; r >= 0; r--) for (let c = 0; c < C; c++) {
    const X = ox + c * zij + r * d, Y = oy - r * d2;
    s += '<polygon points="' + X + ',' + (Y + zij) + ' ' + (X + d) + ',' + (Y + zij - d2) + ' ' +
      (X + zij + d) + ',' + (Y + zij - d2) + ' ' + (X + zij) + ',' + (Y + zij) +
      '" fill="#eef3f8" stroke="#d3e0ec" stroke-width="1.5"/>';
  }
  /* de blokjes: van achter naar voren, van onder naar boven */
  for (let r = R - 1; r >= 0; r--) for (let c = 0; c < C; c++) for (let z = 0; z < h[r][c]; z++) {
    const X = ox + c * zij + r * d, Y = oy - r * d2 - z * zij;
    s += '<polygon points="' + X + ',' + Y + ' ' + (X + d) + ',' + (Y - d2) + ' ' + (X + zij + d) + ',' + (Y - d2) + ' ' + (X + zij) + ',' + Y +
      '" fill="#ffd0e4" stroke="#c22458" stroke-width="1.5"/>';
    s += '<polygon points="' + (X + zij) + ',' + Y + ' ' + (X + zij + d) + ',' + (Y - d2) + ' ' + (X + zij + d) + ',' + (Y + zij - d2) + ' ' + (X + zij) + ',' + (Y + zij) +
      '" fill="#e05a90" stroke="#c22458" stroke-width="1.5"/>';
    s += '<rect x="' + X + '" y="' + Y + '" width="' + zij + '" height="' + zij + '" fill="#ff85b3" stroke="#c22458" stroke-width="1.5"/>';
  }
  return svg(s, W, H);
}
function roosterPlaatje(rijen, kols, vol, maat) {
  maat = maat || 30;
  let s = "";
  for (let r = 0; r < rijen; r++) for (let c = 0; c < kols; c++) {
    s += '<rect x="' + (c * maat + 2) + '" y="' + (r * maat + 2) + '" width="' + (maat - 4) + '" height="' + (maat - 4) +
      '" rx="6" fill="' + (vol(r, c) ? "#ff85b3" : "#fff2f8") + '" stroke="' + (vol(r, c) ? "#c22458" : "#ffd6e7") + '" stroke-width="2"/>';
  }
  const d = svg(s, kols * maat, rijen * maat);
  d.style.width = (kols * maat) + "px";
  return d;
}
function willekeurigBouwwerk(niv) {
  const R = niv === 1 ? 2 : 2, C = niv === 1 ? 2 : 3;
  const h = [];
  let totaal = 0;
  for (let r = 0; r < R; r++) {
    const rij = [];
    for (let c = 0; c < C; c++) { const v = rnd(0, niv === 1 ? 2 : 3); rij.push(v); totaal += v; }
    h.push(rij);
  }
  if (totaal < 3) return willekeurigBouwwerk(niv);
  const leeg = h.map(r => r.filter(v => v === 0).length).reduce((a, b) => a + b, 0);
  if (leeg === 0 || leeg > 2) return willekeurigBouwwerk(niv);
  return h;
}
SPELLEN.aanzichten = {
  titel: "Aanzichten", emoji: "🧊", kleur: "#7c6ce8",
  doel: "Ik leer over aanzichten",
  maak(niv) {
    const h = willekeurigBouwwerk(niv);
    const R = h.length, C = h[0].length;
    const totaal = h.map(r => r.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    const soort = niv === 1 ? kies(["tellen", "boven"]) : kies(["boven", "voor", "tellen", "voor"]);

    if (soort === "tellen")
      return invulVraag("Hoeveel blokjes zijn er gebruikt voor dit bouwwerk?", vlak => {
        vlak.appendChild(isoBouwwerk(h));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(el("div", { class: "hokje", tekst: "blokjes", stijl: "background:none;font-size:24px" }));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [totaal], "Tel per stapel: samen " + totaal + " blokjes.");

    let opties, goed, vraagTekst, uitleg;
    if (soort === "boven") {
      /* in het bovenaanzicht staat de voorste rij (r = 0) onderaan */
      const echt = h.slice().reverse().map(rij => rij.map(v => v > 0));
      const maakFout = () => {
        const k = echt.map(r => r.slice());
        const r = rnd(0, R - 1), c = rnd(0, C - 1);
        k[r][c] = !k[r][c];
        return k;
      };
      const alle = [echt];
      let wacht = 0;
      while (alle.length < 3 && wacht++ < 50) {
        const f = maakFout();
        if (!alle.some(a => JSON.stringify(a) === JSON.stringify(f))) alle.push(f);
      }
      opties = schud(alle);
      goed = opties.findIndex(a => JSON.stringify(a) === JSON.stringify(echt));
      return keuzeVraag({
        opdracht: "Je kijkt van bovenaf op het bouwwerk. Welk plaatje is het <b>bovenaanzicht</b>?",
        uitleg: "Van boven zie je precies waar blokjes staan, niet hoe hoog ze zijn.",
        opties, goed, plaatje: true,
        boven(vlak) { vlak.appendChild(isoBouwwerk(h)); },
        inhoud(knop, o) { knop.appendChild(roosterPlaatje(R, C, (r, c) => o[r][c], 34)); }
      });
    }
    /* vooraanzicht */
    const hoogtes = reeks(C, c => Math.max.apply(null, h.map(r => r[c])));
    const maxH = Math.max.apply(null, hoogtes);
    const alle = [hoogtes];
    let wacht = 0;
    while (alle.length < 3 && wacht++ < 60) {
      const f = hoogtes.slice();
      const c = rnd(0, C - 1);
      f[c] = Math.max(0, Math.min(maxH + 1, f[c] + kies([-1, 1])));
      if (!alle.some(a => a.join() === f.join())) alle.push(f);
    }
    opties = schud(alle);
    goed = opties.findIndex(a => a.join() === hoogtes.join());
    const hoogste = Math.max.apply(null, opties.map(o => Math.max.apply(null, o)));
    return keuzeVraag({
      opdracht: "Je kijkt van de voorkant naar het bouwwerk. Welk plaatje is het <b>vooraanzicht</b>?",
      uitleg: "Van voren zie je hoe hoog elke stapel is: " + hoogtes.join(" - ") + ".",
      opties, goed, plaatje: true,
      boven(vlak) { vlak.appendChild(isoBouwwerk(h)); },
      inhoud(knop, o) { knop.appendChild(roosterPlaatje(hoogste, C, (r, c) => (hoogste - r) <= o[c], 34)); }
    });
  }
};

/* =========================================================================
   9. Optellen en aftrekken op de getallenlijn
   ========================================================================= */
SPELLEN.getallenlijn = {
  titel: "De getallenlijn", emoji: "📍", kleur: "#d63384",
  doel: "Ik kan optellen en aftrekken met hulp van een getallenlijn",
  maak(niv) {
    const soort = niv === 1 ? kies(["zetten", "springen"]) : kies(["springen", "zetten", "springen"]);

    if (soort === "zetten") {
      const max = niv === 1 ? 20 : niv === 2 ? 50 : 100;
      const doel = rnd(1, max - 1);
      let pos = null, marker = null, bubbel = null, lijn = null;
      return {
        opdracht: "Zet de pijl op het getal <b>" + doel + "</b>. Tik of sleep op de getallenlijn.",
        uitleg: "Zoek eerst het tiental, tel dan verder.",
        bouw(vlak) {
          lijn = getallenlijn(0, max, { hoogte: 130, basis: 90, groteStap: max > 30 ? 10 : 5 });
          const s = lijn.svgEl;
          s.insertAdjacentHTML("beforeend",
            '<g id="wijzer"><path d="M0 -34 L11 -12 L-11 -12 Z" fill="#e0324f"/>' +
            '<rect x="-26" y="-70" width="52" height="32" rx="10" fill="#e0324f"/>' +
            '<text id="bub" x="0" y="-48" text-anchor="middle" font-size="20" font-weight="bold" font-family="Trebuchet MS" fill="#fff">0</text></g>');
          marker = s.querySelector("#wijzer");
          bubbel = s.querySelector("#bub");
          const zet = v => {
            pos = Math.max(0, Math.min(max, v));
            marker.setAttribute("transform", "translate(" + lijn.xVan(pos) + "," + lijn.basis + ")");
            bubbel.textContent = pos;
          };
          const uitEvent = ev => {
            const r = s.getBoundingClientRect();
            const schaal = r.width / lijn.W;
            const v = Math.round(((ev.clientX - r.left) / schaal - lijn.pad) / ((lijn.W - 2 * lijn.pad) / max));
            if (v !== pos) { zet(v); Geluid.klik(); }
          };
          s.style.touchAction = "none"; s.style.cursor = "pointer";
          s.addEventListener("pointerdown", ev => { s.setPointerCapture(ev.pointerId); s._sleept = true; uitEvent(ev); });
          s.addEventListener("pointermove", ev => { if (s._sleept) uitEvent(ev); });
          s.addEventListener("pointerup", () => { s._sleept = false; });
          s.addEventListener("pointercancel", () => { s._sleept = false; });
          zet(0);
          vlak.appendChild(lijn.node);
          vlak.appendChild(el("div", { class: "label", tekst: "Tik of sleep op de lijn." }));
          this._zet = zet;
        },
        check() { return pos === doel; },
        toon() { if (this._zet) this._zet(doel); }
      };
    }

    /* springen naar het antwoord */
    let a, b, plus = Math.random() < .5;
    if (niv === 1) { a = rnd(6, 18); b = rnd(2, 5); }
    else if (niv === 2) { b = rnd(1, 4) * 10; a = plus ? rnd(10, 90 - b) : rnd(b + 5, 95); }
    else { b = rnd(1, 3) * 10 + rnd(1, 8); a = plus ? rnd(11, 95 - b) : rnd(b + 11, 99); }
    const antwoord = plus ? a + b : a - b;
    const max = 100;
    let pos = a;
    const sprongen = [];
    let houder = null, teller = null;
    function teken() {
      houder.innerHTML = "";
      const lijn = getallenlijn(0, max, { hoogte: 160, basis: 118, groteStap: 10 });
      let extra = PIJLPUNT;
      let p = a;
      sprongen.forEach(s => {
        extra += boogje(lijn.xVan(p), lijn.xVan(p + s), lijn.basis, (s > 0 ? "+" : "−") + Math.abs(s), "#e0324f");
        p += s;
      });
      extra += '<circle cx="' + lijn.xVan(a) + '" cy="' + lijn.basis + '" r="7" fill="#2f7ff0"/>';
      extra += '<circle cx="' + lijn.xVan(pos) + '" cy="' + lijn.basis + '" r="9" fill="#15a24a"/>';
      extra += '<text x="' + lijn.xVan(pos) + '" y="' + (lijn.basis - 78) + '" text-anchor="middle" font-size="21" font-weight="bold" font-family="Trebuchet MS" fill="#15a24a">' + pos + "</text>";
      lijn.svgEl.insertAdjacentHTML("beforeend", extra);
      houder.appendChild(lijn.node);
      teller.textContent = "Je staat nu op " + pos + ".";
    }
    return {
      opdracht: "Reken uit met sprongen: <b>" + a + " " + (plus ? "+" : "−") + " " + b + " = ?</b>",
      uitleg: a + " " + (plus ? "+" : "−") + " " + b + " = " + antwoord + ". Spring eerst met tientallen, dan met eentjes.",
      bouw(vlak) {
        houder = el("div", { stijl: "width:100%" });
        teller = el("div", { class: "label", stijl: "font-size:19px;color:#12293d;font-weight:bold" });
        vlak.appendChild(houder);
        vlak.appendChild(teller);
        const knoppen = el("div", { class: "rij" });
        [["−10", -10], ["−1", -1], ["+1", 1], ["+10", 10]].forEach(([t, s]) => {
          knoppen.appendChild(el("button", {
            class: "knop stil", type: "button", tekst: t,
            onclick: () => {
              if (pos + s < 0 || pos + s > max) return;
              sprongen.push(s); pos += s; Geluid.klik(); teken();
            }
          }));
        });
        knoppen.appendChild(el("button", {
          class: "knop stil", type: "button", tekst: "↺ opnieuw",
          onclick: () => { sprongen.length = 0; pos = a; teken(); }
        }));
        vlak.appendChild(knoppen);
        teken();
      },
      check() { return pos === antwoord; },
      toon() {
        sprongen.length = 0; pos = a;
        let rest = Math.abs(antwoord - a), teken1 = antwoord > a ? 1 : -1;
        while (rest >= 10) { sprongen.push(10 * teken1); pos += 10 * teken1; rest -= 10; }
        while (rest > 0) { sprongen.push(teken1); pos += teken1; rest -= 1; }
        teken();
      }
    };
  }
};

/* =========================================================================
   10. Seizoenen en maanden
   ========================================================================= */
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const SEIZOENEN = [
  { naam: "lente", emoji: "🌷", maanden: ["maart", "april", "mei"] },
  { naam: "zomer", emoji: "☀️", maanden: ["juni", "juli", "augustus"] },
  { naam: "herfst", emoji: "🍂", maanden: ["september", "oktober", "november"] },
  { naam: "winter", emoji: "❄️", maanden: ["december", "januari", "februari"] }
];
const seizoenVan = m => SEIZOENEN.find(s => s.maanden.indexOf(m) >= 0);

SPELLEN.tijd = {
  titel: "Maanden en seizoenen", emoji: "🌸", kleur: "#2fa8a0",
  doel: "Ik leer over seizoenen en maanden",
  maak(niv) {
    const soort = niv === 1 ? kies(["seizoen", "volgorde", "sorteren"]) : kies(["sorteren", "hoeveelste", "volgorde", "seizoen"]);

    if (soort === "seizoen") {
      const m = kies(MAANDEN);
      const goedSeizoen = seizoenVan(m);
      const opties = schud(SEIZOENEN.slice());
      return keuzeVraag({
        opdracht: "In welk seizoen ligt de maand <b>" + m + "</b>?",
        uitleg: m + " hoort bij de " + goedSeizoen.naam + " (" + goedSeizoen.maanden.join(", ") + ").",
        opties, goed: opties.indexOf(goedSeizoen),
        inhoud(knop, s) { knop.innerHTML = '<div style="font-size:34px">' + s.emoji + "</div>" + s.naam; }
      });
    }

    if (soort === "hoeveelste") {
      const m = kies(MAANDEN), n = MAANDEN.indexOf(m) + 1;
      return invulVraag("De hoeveelste maand van het jaar is <b>" + m + "</b>?", vlak => {
        const rij = el("div", { class: "rij" });
        MAANDEN.forEach((x, i) => rij.appendChild(el("div", {
          class: "hokje", tekst: (i + 1) + ". " + x.slice(0, 3),
          stijl: "font-size:15px;min-width:60px;height:44px;" + (x === m ? "background:#ffe9a8" : "")
        })));
        vlak.appendChild(rij);
        const r2 = el("div", { class: "rij" });
        r2.appendChild(invoerVak());
        r2.appendChild(el("div", { class: "hokje", tekst: "e maand", stijl: "background:none;font-size:22px" }));
        vlak.appendChild(r2);
        vlak.appendChild(cijferpad());
      }, [n], m + " is maand nummer " + n + ".");
    }

    if (soort === "volgorde") {
      const i = rnd(0, 11);
      const na = Math.random() < .5;
      const goedMaand = MAANDEN[(i + (na ? 1 : 11)) % 12];
      const opties = schud([goedMaand].concat(schud(MAANDEN.filter(x => x !== goedMaand && x !== MAANDEN[i])).slice(0, 2)));
      return keuzeVraag({
        opdracht: "Welke maand komt <b>" + (na ? "na" : "vóór") + " " + MAANDEN[i] + "</b>?",
        uitleg: "De volgorde is: ... " + MAANDEN[(i + 11) % 12] + ", " + MAANDEN[i] + ", " + MAANDEN[(i + 1) % 12] + " ...",
        opties, goed: opties.indexOf(goedMaand),
        inhoud(knop, m) { knop.textContent = m; knop.style.fontSize = "22px"; }
      });
    }

    /* sorteren: maanden naar het goede seizoen slepen */
    const gekozenSeizoenen = schud(SEIZOENEN.slice()).slice(0, niv === 1 ? 2 : 3);
    const kaartjes = schud(gekozenSeizoenen.map(s => kies(s.maanden)));
    const geplaatst = {};
    return {
      opdracht: "Zet elke maand bij het goede seizoen. Tik een maand aan en daarna het seizoen, of sleep hem.",
      uitleg: kaartjes.map(m => m + " → " + seizoenVan(m).naam).join(", ") + ".",
      bouw(vlak) {
        const bakken = el("div", { class: "rij", stijl: "align-items:flex-start;gap:14px;width:100%" });
        gekozenSeizoenen.forEach(s => {
          const kolom = el("div", { stijl: "flex:1;min-width:170px" });
          kolom.appendChild(el("div", { class: "label", html: '<span style="font-size:26px">' + s.emoji + "</span><br>" + s.naam }));
          const bak = el("div", { class: "bak", stijl: "min-height:86px" });
          dropzone(bak, (bron, maand) => {
            if (geplaatst[maand]) return;
            const kaart = el("div", { class: "hokje", tekst: maand, stijl: "background:#ffe9a8;font-size:19px;cursor:pointer" });
            kaart.addEventListener("click", () => { kaart.remove(); delete geplaatst[maand]; bron.style.visibility = "visible"; });
            bak.appendChild(kaart);
            geplaatst[maand] = s.naam;
            if (bron) bron.style.visibility = "hidden";
            Geluid.klik();
          });
          kolom.appendChild(bak);
          bakken.appendChild(kolom);
        });
        vlak.appendChild(bakken);
        const voorraad = el("div", { class: "voorraad" });
        kaartjes.forEach(m => {
          const kaart = el("div", { class: "hokje", tekst: m, stijl: "background:#ffe9a8;font-size:19px" });
          sleepbaar(kaart, m);
          voorraad.appendChild(kaart);
        });
        vlak.appendChild(voorraad);
      },
      check() { return kaartjes.every(m => geplaatst[m] === seizoenVan(m).naam); }
    };
  }
};
/* De vaste volgorde van de tien lesdoelen. Elke ronde komen ze allemaal een keer
   aan de beurt, in een andere volgorde: door elkaar oefenen blijft het beste hangen. */
const SPELVOLGORDE = ["tellen", "meten", "splitsen", "sprongen", "plusmin", "geld", "herhaald", "aanzichten", "getallenlijn", "tijd"];
