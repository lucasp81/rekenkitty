/* =========================================================================
   spellen2.js - een vraaggenerator per lesdoel van Alles telt Q, groep 4, blok 2
   Gebruikt de bouwstenen uit kern.js en een paar hulpjes uit spellen.js
   (groepjes, mabPlaatje, PLAATJES).
   ========================================================================= */
"use strict";

/* los woord of teken naast een invulvakje */
function woord(tekst, maat) {
  return el("div", { class: "hokje", tekst, stijl: "background:none;font-size:" + (maat || 22) + "px" });
}
/* een som als rij: getallen en tekens als tekst, "?" wordt een invulvakje */
function somRij(delen) {
  const rij = el("div", { class: "som" });
  delen.forEach(d => rij.appendChild(d === "?" ? invoerVak() : el("span", { tekst: String(d) })));
  return rij;
}
/* verschillende getallen uit een bereik */
function verschillend(n, van, tot) { return schud(reeks(tot - van + 1, i => van + i)).slice(0, n); }

/* =========================================================================
   1. Optellen en aftrekken over het tiental
   ========================================================================= */
SPELLEN.overtiental = {
  titel: "Over het tiental", emoji: "🔟", blok: 2,
  doel: "Ik oefen optellen en aftrekken over het tiental",
  maak(niv) {
    const plus = Math.random() < .5;
    /* tot 20 op niveau 1, op niveau 2 soms, op niveau 3 tot 100 */
    const tot20 = niv === 1 || (niv === 2 && Math.random() < .5);
    let a, b;
    if (tot20) {
      if (plus) { a = rnd(5, 9); b = rnd(11 - a, 9); }
      else { a = rnd(11, 17); b = rnd(a - 9, 9); }
    } else if (plus) {
      const e = rnd(4, 9); a = rnd(1, 8) * 10 + e; b = rnd(11 - e, 9);
    } else {
      const e = rnd(1, 7); a = rnd(2, 9) * 10 + e; b = rnd(e + 1, 9);
    }
    const uitkomst = plus ? a + b : a - b;
    const teken = plus ? "+" : "−";
    const tiental = plus ? a - a % 10 + 10 : a - a % 10;
    const eerst = plus ? tiental - a : a % 10;
    const rest = b - eerst;
    const somTekst = a + " " + teken + " " + b + " = " + uitkomst;
    const stappen = "Eerst naar " + tiental + ": " + a + " " + teken + " " + eerst + " = " + tiental +
      ". Dan de rest: " + tiental + " " + teken + " " + rest + " = " + uitkomst + ".";

    const soort = niv === 1 ? kies(["som", "som", "stappen"]) : kies(["som", "stappen", "gat"]);
    let vraag;
    if (soort === "stappen") {
      vraag = invulVraag("Reken uit in twee stappen: <b>" + a + " " + teken + " " + b + "</b>", vlak => {
        vlak.appendChild(el("div", { class: "label", tekst: "Spring eerst naar " + tiental + ". Hoeveel moet er dan nog " + (plus ? "bij" : "af") + "?" }));
        vlak.appendChild(somRij([a, teken, "?", "=", tiental]));
        vlak.appendChild(somRij([tiental, teken, "?", "=", "?"]));
        vlak.appendChild(cijferpad());
      }, [eerst, rest, uitkomst], b + " splits je in " + eerst + " en " + rest + ". " + stappen);
    } else if (soort === "gat") {
      vraag = invulVraag("Welk getal hoort in het lege vakje?", vlak => {
        vlak.appendChild(somRij([a, teken, "?", "=", uitkomst]));
        vlak.appendChild(cijferpad());
      }, [b], somTekst + ". " + stappen);
    } else {
      vraag = invulVraag("Reken uit.", vlak => {
        vlak.appendChild(somRij([a, teken, b, "=", "?"]));
        vlak.appendChild(cijferpad());
      }, [uitkomst], stappen);
    }
    vraag.hulp = () => {
      const d = el("div", { class: "hulpvak" });
      if (a <= 20) {
        d.appendChild(el("div", { class: "label", tekst: plus ? "Blauw is " + a + ". Er komen " + b + " oranje bij. Maak eerst de bovenste rij vol." : "Er zijn " + a + " stippen. Er gaan er " + b + " weg." }));
        d.appendChild(tienvlakken(a, b, !plus));
      } else {
        d.appendChild(el("div", {
          class: "label", stijl: "font-size:18px",
          tekst: plus ? "Hoeveel moet er bij " + a + " om op " + tiental + " te komen? Doe daarna de rest erbij."
                      : "Haal er eerst " + eerst + " af, dan kom je op " + tiental + ". Haal daarna de rest eraf."
        }));
      }
      return d;
    };
    return vraag;
  }
};

/* =========================================================================
   2. Vierkant en kubus
   ========================================================================= */
const VORMNAAM = {
  vierkant: "vierkant", kubus: "kubus", rechthoek: "rechthoek", driehoek: "driehoek",
  cirkel: "cirkel", balk: "balk", bol: "bol", cilinder: "cilinder"
};
function vormPlaatje(soort, maat) {
  const rand = 'stroke="#c22458" stroke-width="3" stroke-linejoin="round"';
  const v = {
    vierkant: '<rect x="20" y="20" width="60" height="60" fill="#ff85b3" ' + rand + '/>',
    rechthoek: '<rect x="8" y="32" width="84" height="38" fill="#ff85b3" ' + rand + '/>',
    driehoek: '<polygon points="50,14 90,84 10,84" fill="#ff85b3" ' + rand + '/>',
    cirkel: '<circle cx="50" cy="50" r="36" fill="#ff85b3" ' + rand + '/>',
    kubus: '<polygon points="16,36 34,18 84,18 66,36" fill="#ffd0e4" ' + rand + '/>' +
      '<polygon points="66,36 84,18 84,68 66,86" fill="#e05a90" ' + rand + '/>' +
      '<rect x="16" y="36" width="50" height="50" fill="#ff85b3" ' + rand + '/>',
    balk: '<polygon points="6,48 22,32 94,32 78,48" fill="#ffd0e4" ' + rand + '/>' +
      '<polygon points="78,48 94,32 94,64 78,80" fill="#e05a90" ' + rand + '/>' +
      '<rect x="6" y="48" width="72" height="32" fill="#ff85b3" ' + rand + '/>',
    bol: '<circle cx="50" cy="52" r="36" fill="#ff85b3" ' + rand + '/>' +
      '<ellipse cx="50" cy="52" rx="36" ry="10" fill="none" stroke="#c22458" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<ellipse cx="37" cy="37" rx="10" ry="7" fill="#fff" opacity=".55"/>',
    cilinder: '<path d="M22 26 L22 76 A28 10 0 0 0 78 76 L78 26" fill="#e05a90" ' + rand + '/>' +
      '<ellipse cx="50" cy="26" rx="28" ry="10" fill="#ffd0e4" ' + rand + '/>'
  };
  const d = svg(v[soort], 100, 100);
  d.style.width = (maat || 90) + "px";
  return d;
}
/* bouwplaat: lijst van [rij, kolom] vierkantjes */
function bouwplaatPlaatje(cellen, maat) {
  maat = maat || 24;
  const R = Math.max.apply(null, cellen.map(c => c[0])) + 1;
  const C = Math.max.apply(null, cellen.map(c => c[1])) + 1;
  let s = "";
  cellen.forEach(([r, c]) => {
    s += '<rect x="' + (c * maat + 2) + '" y="' + (r * maat + 2) + '" width="' + maat + '" height="' + maat +
      '" fill="#ff85b3" stroke="#c22458" stroke-width="2"/>';
  });
  const d = svg(s, C * maat + 4, R * maat + 4);
  d.style.width = (C * maat + 4) + "px";
  return d;
}
const GOEDE_BOUWPLAAT = () => {
  /* een rij van vier met er één boven en één onder: die vouw je altijd tot een kubus */
  const b = rnd(0, 3), o = rnd(0, 3);
  return [[0, b], [1, 0], [1, 1], [1, 2], [1, 3], [2, o]];
};
const FOUTE_BOUWPLATEN = [
  () => [[0, rnd(0, 3)], [1, 0], [1, 1], [1, 2], [1, 3]],                /* maar 5 vierkanten */
  () => [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]],                /* zes op een rij */
  () => [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],                /* twee rijen van drie */
  () => [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [1, 3]]                 /* twee boven naast elkaar */
];

SPELLEN.kubus = {
  titel: "Vierkant en kubus", emoji: "🎲", blok: 2,
  doel: "Ik herken hoe een vierkant en een kubus bij elkaar horen",
  maak(niv) {
    const soort = niv === 1 ? kies(["kubus", "vierkant", "ding", "stempel"])
      : niv === 2 ? kies(["kubus", "stempel", "aantal", "ding", "vierkant"])
      : kies(["aantal", "bouwplaat", "bouwplaat", "stempel", "kubus"]);

    const vormKeuze = (opdracht, goed, anderen, uitleg, boven) => {
      const opties = schud([goed].concat(anderen));
      return keuzeVraag({
        opdracht, uitleg, opties, goed: opties.indexOf(goed), plaatje: true, boven,
        inhoud(knop, v) {
          knop.appendChild(vormPlaatje(v, 92));
          knop.appendChild(el("div", { class: "label", tekst: VORMNAAM[v] }));
        }
      });
    };

    if (soort === "kubus")
      return vormKeuze("Welke vorm is een <b>kubus</b>?", "kubus",
        niv === 1 ? ["vierkant", "bol"] : ["vierkant", "balk", kies(["cilinder", "bol"])],
        "Een kubus is een blok. Alle kanten zijn vierkanten, even groot. Een vierkant is plat.");

    if (soort === "vierkant")
      return vormKeuze("Welke vorm is een <b>vierkant</b>?", "vierkant",
        niv === 1 ? ["kubus", "cirkel"] : ["kubus", "rechthoek", "driehoek"],
        "Een vierkant is plat en heeft vier even lange kanten. Een kubus is geen platte vorm.");

    if (soort === "stempel")
      return vormKeuze("Je doopt één kant van de kubus in de verf en drukt hem op papier. Welke vorm zie je dan?",
        "vierkant", niv === 1 ? ["cirkel", "driehoek"] : ["cirkel", "driehoek", "rechthoek"],
        "Elke kant van een kubus is een vierkant. Dus je stempelt een vierkant.",
        vlak => vlak.appendChild(vormPlaatje("kubus", 120)));

    if (soort === "ding") {
      const dingen = [["🎲", "dobbelsteen"], ["⚽", "bal"], ["🥫", "blikje"], ["🍕", "pizzapunt"]];
      const opties = schud(niv === 1 ? dingen.slice(0, 3) : dingen);
      return keuzeVraag({
        opdracht: "Welk ding heeft de vorm van een <b>kubus</b>?",
        uitleg: "Een dobbelsteen is een kubus: zes vierkante kanten.",
        opties, goed: opties.indexOf(dingen[0]),
        inhoud(knop, d) { knop.innerHTML = '<div style="font-size:48px;line-height:1.2">' + d[0] + "</div>" + d[1]; }
      });
    }

    if (soort === "aantal")
      return invulVraag("Van deze bouwplaat vouw je een kubus. Hoeveel <b>vierkanten</b> heeft een kubus?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:30px" });
        rij.appendChild(bouwplaatPlaatje(GOEDE_BOUWPLAAT(), 36));
        rij.appendChild(woord("→", 34));
        rij.appendChild(vormPlaatje("kubus", 120));
        vlak.appendChild(rij);
        const r2 = el("div", { class: "rij" });
        r2.appendChild(invoerVak());
        r2.appendChild(woord("vierkanten"));
        vlak.appendChild(r2);
        vlak.appendChild(cijferpad());
      }, [6], "Een kubus heeft 6 kanten, en elke kant is een vierkant: boven, onder, voor, achter, links en rechts.");

    /* bouwplaat kiezen */
    const goedePlaat = GOEDE_BOUWPLAAT();
    const opties = schud([goedePlaat].concat(schud(FOUTE_BOUWPLATEN).slice(0, 3).map(f => f())));
    return keuzeVraag({
      opdracht: "Welke bouwplaat kun je vouwen tot een <b>kubus</b>?",
      uitleg: "Een kubus heeft 6 vierkanten. Bij de goede bouwplaat komt elk vierkant op een andere kant terecht.",
      opties, goed: opties.indexOf(goedePlaat), plaatje: true,
      boven(vlak) { vlak.appendChild(vormPlaatje("kubus", 110)); },
      inhoud(knop, p) { knop.appendChild(bouwplaatPlaatje(p, 32)); }
    });
  }
};

/* =========================================================================
   3. Herhaald optellen (verder dan in blok 1)
   ========================================================================= */
function rijtjes(r, k, plaatje) {
  const g = el("div", {
    stijl: "display:grid;grid-template-columns:repeat(" + k + ",auto);gap:4px 8px;padding:10px 14px;" +
      "border:3px solid #cddcea;border-radius:16px;background:#fbfdff;font-size:26px;line-height:1.1"
  });
  for (let i = 0; i < r * k; i++) g.appendChild(el("span", { tekst: plaatje }));
  return g;
}
SPELLEN.herhaald2 = {
  titel: "Herhaald optellen", emoji: "🔁", blok: 2,
  doel: "Ik oefen herhaald optellen",
  maak(niv) {
    const plaatje = kies(PLAATJES);
    const k = niv === 1 ? kies([2, 5, 10]) : niv === 2 ? kies([2, 3, 4, 5, 10]) : kies([3, 4, 5, 6, 10]);
    const n = niv === 1 ? rnd(2, 5) : niv === 2 ? rnd(3, 6) : rnd(4, 8);
    const totaal = n * k;
    const som = reeks(n, () => k).join(" + ");
    const soort = niv === 1 ? kies(["rijtjes", "sprongen", "somschrijven"])
      : niv === 2 ? kies(["rijtjes", "sprongen", "somschrijven", "verhaal"])
      : kies(["rijtjes", "sprongen", "verhaal"]);

    if (soort === "rijtjes")
      return invulVraag("Hoeveel rijen zie je, hoeveel zitten er in elke rij, en hoeveel zijn het er samen?", vlak => {
        vlak.appendChild(rijtjes(n, k, plaatje));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord("rijen van"));
        rij.appendChild(invoerVak());
        rij.appendChild(woord("= samen"));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [n, k, totaal], n + " rijen van " + k + ": " + som + " = " + totaal + ".");

    if (soort === "somschrijven" && n <= 5)
      return invulVraag("Schrijf de plussom op die bij de groepjes hoort, en reken hem uit.", vlak => {
        vlak.appendChild(groepjes(n, k, plaatje));
        const delen = [];
        for (let i = 0; i < n; i++) { if (i) delen.push("+"); delen.push("?"); }
        delen.push("=", "?");
        vlak.appendChild(somRij(delen));
        vlak.appendChild(cijferpad());
      }, reeks(n, () => k).concat([totaal]), som + " = " + totaal + ".");

    if (soort === "sprongen") {
      const max = totaal <= 20 ? 20 : totaal <= 50 ? 50 : 100;
      return invulVraag("De kikker maakt steeds even grote sprongen. Hoeveel sprongen maakt hij, en waar komt hij uit?", vlak => {
        const lijn = getallenlijn(0, max, {
          hoogte: 150, basis: 108,
          groteStap: max === 20 ? 5 : 10, kleineStap: 1
        });
        /* kleinere pijlpunt dan PIJLPUNT: de sprongen zijn hier kort */
        let extra = '<defs><marker id="puntklein" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">' +
          '<path d="M0 0 L12 6 L0 12 z" fill="#e0324f"/></marker></defs>';
        for (let i = 0; i < n; i++) extra += boogje(lijn.xVan(i * k), lijn.xVan((i + 1) * k), lijn.basis, "+" + k, "#e0324f").replace("url(#punt)", "url(#puntklein)");
        extra += '<text x="' + lijn.xVan(0) + '" y="' + (lijn.basis - 14) + '" text-anchor="middle" font-size="22">🐸</text>';
        lijn.svgEl.insertAdjacentHTML("beforeend", extra);
        vlak.appendChild(lijn.node);
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord("sprongen van " + k + " ="));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [n, totaal], n + " sprongen van " + k + ": " + som + " = " + totaal + ".");
    }

    /* verhaaltje */
    const verhalen = [
      ["zakjes", "zakje", "snoepjes", "🍬"], ["bordjes", "bordje", "koekjes", "🍪"], ["vazen", "vaas", "bloemen", "🌸"],
      ["doosjes", "doosje", "cupcakes", "🧁"], ["bakjes", "bakje", "aardbeien", "🍓"], ["mandjes", "mandje", "eieren", "🥚"]
    ];
    const v = kies(verhalen);
    return invulVraag("Er zijn <b>" + n + " " + v[0] + "</b>. In elk" + (v[1] === "vaas" ? "e " : " ") + v[1] +
      " zitten <b>" + k + " " + v[2] + "</b>. Hoeveel " + v[2] + " zijn het samen?", vlak => {
      if (niv < 3) vlak.appendChild(groepjes(n, k, v[3]));
      else vlak.appendChild(el("div", { class: "label", tekst: "Tip: maak er een plussom van." }));
      const rij = el("div", { class: "rij" });
      rij.appendChild(invoerVak());
      rij.appendChild(woord(v[2]));
      vlak.appendChild(rij);
      vlak.appendChild(cijferpad());
    }, [totaal], som + " = " + totaal + " " + v[2] + ".");
  }
};

/* =========================================================================
   4. Klokkijken: hele en halve uren
   ========================================================================= */
/* u = 1..12, m = 0 of 30. verwisseld: de wijzers zitten omgedraaid (om te oefenen welke welke is) */
function klokPlaatje(u, m, maat, verwisseld) {
  const c = 100;
  let s = '<circle cx="100" cy="100" r="92" fill="#fff" stroke="#ff4d87" stroke-width="7"/>';
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * Math.PI / 180, lang = i % 5 === 0;
    const r1 = lang ? 76 : 81, r2 = 86;
    s += '<line x1="' + (c + r1 * Math.sin(a)) + '" y1="' + (c - r1 * Math.cos(a)) + '" x2="' + (c + r2 * Math.sin(a)) +
      '" y2="' + (c - r2 * Math.cos(a)) + '" stroke="' + (lang ? "#43263a" : "#c9b6c0") + '" stroke-width="' + (lang ? 3 : 1.5) + '"/>';
  }
  for (let i = 1; i <= 12; i++) {
    const a = i * 30 * Math.PI / 180;
    s += '<text x="' + (c + 62 * Math.sin(a)) + '" y="' + (c - 62 * Math.cos(a) + 8) +
      '" text-anchor="middle" font-size="22" font-weight="bold" font-family="Trebuchet MS" fill="#43263a">' + i + "</text>";
  }
  const wijzer = (graden, lengte, dikte, kleur) => {
    const a = graden * Math.PI / 180;
    return '<line x1="100" y1="100" x2="' + (c + lengte * Math.sin(a)) + '" y2="' + (c - lengte * Math.cos(a)) +
      '" stroke="' + kleur + '" stroke-width="' + dikte + '" stroke-linecap="round"/>';
  };
  let uurHoek = ((u % 12) + m / 60) * 30, minHoek = m * 6;
  if (verwisseld) { const h = uurHoek; uurHoek = minHoek; minHoek = h; }
  s += wijzer(uurHoek, 44, 10, "#43263a");
  s += wijzer(minHoek, 72, 5, "#ff4d87");
  s += '<circle cx="100" cy="100" r="7" fill="#43263a"/>';
  const d = svg(s, 200, 200);
  d.style.width = (maat || 180) + "px";
  return d;
}
/* tijd als aantal halve uren sinds 12 uur (0..23) */
const tijdVan = t => { t = ((t % 24) + 24) % 24; return { u: Math.floor(t / 2) || 12, m: t % 2 ? 30 : 0 }; };
const halfUren = (u, m) => (u % 12) * 2 + (m ? 1 : 0);
const tijdNaam = (u, m) => m === 0 ? u + " uur" : "half " + (u % 12 + 1);

SPELLEN.klok = {
  titel: "Klokkijken", emoji: "🕒", blok: 2,
  doel: "Ik oefen klokkijken met hele en halve uren",
  maak(niv) {
    const alleenHeel = niv === 1;
    const u = rnd(1, 12), m = alleenHeel ? 0 : kies([0, 30, 30]);
    const naam = tijdNaam(u, m);
    const uitlegTijd = m === 0
      ? "De lange wijzer staat op de 12 en de korte wijzer op de " + u + ". Het is " + naam + "."
      : "De lange wijzer staat op de 6: het is half. De korte wijzer staat tussen de " + u + " en de " + (u % 12 + 1) +
        ". Het is half " + (u % 12 + 1) + ": nog een half uur, dan is het " + (u % 12 + 1) + " uur.";
    const soort = niv === 1 ? kies(["lezen", "kiesklok", "zetten"])
      : niv === 2 ? kies(["lezen", "kiesklok", "zetten", "lezen"])
      : kies(["lezen", "kiesklok", "zetten", "later", "later"]);

    if (soort === "lezen") {
      const volgend = u % 12 + 1, vorig = (u + 10) % 12 + 1;
      const fout = m === 0
        ? [volgend + " uur", vorig + " uur", "half " + u, "half " + volgend]
        : ["half " + u, u + " uur", volgend + " uur", "half " + (volgend % 12 + 1)];
      const aantal = niv === 1 ? 2 : 3;
      const kandidaten = (m === 0 && niv === 1) ? [volgend + " uur", vorig + " uur", "12 uur", "6 uur"] : fout;
      const opties = schud([naam].concat(schud(kandidaten.filter((x, i, a) => x !== naam && a.indexOf(x) === i)).slice(0, aantal)));
      return keuzeVraag({
        opdracht: "Hoe laat is het?",
        uitleg: uitlegTijd,
        opties, goed: opties.indexOf(naam),
        boven(vlak) { vlak.appendChild(klokPlaatje(u, m, 190)); },
        inhoud(knop, t) { knop.textContent = t; }
      });
    }

    if (soort === "kiesklok") {
      const goed = { u, m };
      let kandidaten;
      if (m === 0) kandidaten = [{ u, m: 0, v: true }, { u: u % 12 + 1, m: 0 }, { u: (u + 5) % 12 + 1, m: 0 }];
      else kandidaten = [{ u: u % 12 + 1, m: 30 }, { u: (u + 10) % 12 + 1, m: 30 }, { u: u % 12 + 1, m: 0 }, { u, m: 0 }];
      /* bij 6 uur en 12 uur zie je omgedraaide wijzers niet goed; dan een andere klok */
      if (m === 0 && (u === 6 || u === 12)) kandidaten[0] = { u: (u + 2) % 12 + 1, m: 0 };
      const opties = schud([goed].concat(schud(kandidaten).slice(0, niv === 1 ? 2 : 3)));
      return keuzeVraag({
        opdracht: "Welke klok wijst <b>" + naam + "</b> aan?",
        uitleg: uitlegTijd,
        opties, goed: opties.indexOf(goed), plaatje: true,
        inhoud(knop, t) { knop.appendChild(klokPlaatje(t.u, t.m, 156, t.v)); }
      });
    }

    if (soort === "later") {
      const stappen = kies([[1, "een half uur later"], [2, "een uur later"], [-1, "een half uur eerder"], [-2, "een uur eerder"]]);
      const nu = { u, m };
      const dan = tijdVan(halfUren(u, m) + stappen[0]);
      const goedNaam = tijdNaam(dan.u, dan.m);
      const anders = [-2, -1, 1, 2, 3].filter(x => x !== stappen[0]).map(x => { const t = tijdVan(halfUren(u, m) + x); return tijdNaam(t.u, t.m); });
      const verkeerdHalf = dan.m === 30 ? "half " + dan.u : null;   /* de klassieke vergissing */
      const pool = (verkeerdHalf ? [verkeerdHalf] : []).concat(schud(anders)).filter((x, i, a) => x !== goedNaam && a.indexOf(x) === i);
      const opties = schud([goedNaam].concat(pool.slice(0, 3)));
      return keuzeVraag({
        opdracht: "Het is <b>" + tijdNaam(nu.u, nu.m) + "</b>. Hoe laat is het <b>" + stappen[1] + "</b>?",
        uitleg: "Van " + tijdNaam(nu.u, nu.m) + " " + (stappen[0] > 0 ? "vooruit" : "terug") + " met " + stappen[1].replace(/ (later|eerder)/, "") +
          " is " + goedNaam + ".",
        opties, goed: opties.indexOf(goedNaam),
        boven(vlak) { vlak.appendChild(klokPlaatje(nu.u, nu.m, 160)); },
        inhoud(knop, t) { knop.textContent = t; }
      });
    }

    /* zelf de klok zetten met knoppen */
    const doel = halfUren(u, m);
    let nu = doel === 0 ? 12 : 0;   /* de klok begint op 12 uur (of op 6 uur als 12 uur het antwoord is) */
    let houder = null;
    const teken = () => {
      houder.innerHTML = "";
      const t = tijdVan(nu);
      houder.appendChild(klokPlaatje(t.u, t.m, 200));
    };
    return {
      opdracht: "Zet de klok op <b>" + naam + "</b>.",
      uitleg: uitlegTijd,
      bouw(vlak) {
        houder = el("div");
        const knop = (tekst, stap) => el("button", {
          class: "knop stil", type: "button", tekst,
          onclick: () => { nu = (nu + stap + 24) % 24; Geluid.klik(); teken(); }
        });
        const rij = el("div", { class: "rij", stijl: "gap:18px" });
        const links = el("div", { stijl: "display:flex;flex-direction:column;gap:10px" });
        const rechts = el("div", { stijl: "display:flex;flex-direction:column;gap:10px" });
        links.appendChild(knop("◀ 1 uur terug", -2));
        rechts.appendChild(knop("1 uur verder ▶", 2));
        if (!alleenHeel) {
          links.appendChild(knop("◀ half uur terug", -1));
          rechts.appendChild(knop("half uur verder ▶", 1));
        }
        rij.appendChild(links); rij.appendChild(houder); rij.appendChild(rechts);
        vlak.appendChild(rij);
        vlak.appendChild(el("div", { class: "label", tekst: "De korte wijzer wijst het uur aan, de lange wijzer de minuten." }));
        teken();
      },
      check() { return nu === doel; },
      toon() { nu = doel; if (houder) teken(); }
    };
  }
};

/* =========================================================================
   5. Kleine hoeveelheden eerlijk verdelen
   ========================================================================= */
const KINDEREN = ["👧", "👦", "🧒", "👩", "🧑"];
/* Uitdelen: tik op een bordje, dan komt er één ding uit de schaal op.
   Tik op iets op een bordje om het terug te leggen. */
function uitdeelVraag(totaal, n, plaatje, opdracht, uitleg) {
  let op = reeks(n, () => 0), inSchaal = totaal, teken = null;
  return {
    opdracht, uitleg,
    bouw(vlak) {
      const schaal = el("div", { class: "voorraad", stijl: "min-height:64px;max-width:640px;font-size:30px;align-items:center" });
      const bordjes = el("div", { class: "rij", stijl: "gap:14px;align-items:flex-start" });
      teken = () => {
        schaal.innerHTML = "";
        schaal.appendChild(el("span", { class: "label", tekst: "In de schaal:" }));
        for (let i = 0; i < inSchaal; i++) schaal.appendChild(el("span", { tekst: plaatje }));
        if (!inSchaal) schaal.appendChild(el("span", { class: "label", tekst: "leeg" }));
        bordjes.innerHTML = "";
        op.forEach((aantal, i) => {
          const kolom = el("div", { stijl: "display:flex;flex-direction:column;align-items:center;gap:4px" });
          kolom.appendChild(el("div", { stijl: "font-size:34px;line-height:1", tekst: KINDEREN[i % KINDEREN.length] }));
          const bord = el("div", {
            class: "bak bordje",
            stijl: "width:clamp(120px,16vw,170px);min-height:clamp(90px,16vh,130px);border-radius:50%;font-size:24px;gap:2px;cursor:pointer"
          });
          for (let j = 0; j < aantal; j++) {
            const ding = el("span", { tekst: plaatje, stijl: "cursor:pointer" });
            ding.addEventListener("click", ev => { ev.stopPropagation(); op[i]--; inSchaal++; Geluid.klik(); teken(); });
            bord.appendChild(ding);
          }
          bord.addEventListener("click", () => {
            if (!inSchaal) return;
            op[i]++; inSchaal--; Geluid.klik(); teken();
          });
          kolom.appendChild(bord);
          bordjes.appendChild(kolom);
        });
      };
      vlak.appendChild(schaal);
      vlak.appendChild(bordjes);
      vlak.appendChild(el("div", { class: "label", tekst: "Tik op een bordje om er één op te leggen. Tik op iets op een bordje om het terug te leggen." }));
      teken();
    },
    check() { return op.every(a => a === op[0]) && inSchaal < n; },
    toon() {
      const ieder = Math.floor(totaal / n);
      op = reeks(n, () => ieder); inSchaal = totaal - ieder * n;
      if (teken) teken();
    }
  };
}
function dingenRij(aantal, plaatje) {
  const d = el("div", { stijl: "display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;max-width:620px;font-size:28px" });
  for (let i = 0; i < aantal; i += 5) {
    d.appendChild(el("span", { tekst: reeks(Math.min(5, aantal - i), () => plaatje).join("") }));
  }
  return d;
}
SPELLEN.verdelen = {
  titel: "Eerlijk verdelen", emoji: "🍪", blok: 2,
  doel: "Ik verdeel kleine hoeveelheden eerlijk",
  maak(niv) {
    const plaatje = kies(["🍓", "🍪", "🧁", "🍬", "🍒", "🎈", "🌸", "🍭"]);
    const n = niv === 1 ? kies([2, 2, 3]) : rnd(2, 4);
    const ieder = niv === 1 ? rnd(2, n === 2 ? 5 : 3) : rnd(2, n === 4 ? 4 : 5);
    const rest = niv === 3 && Math.random() < .6 ? rnd(1, n - 1) : 0;
    const totaal = n * ieder + rest;
    const soort = niv === 1 ? kies(["uitdelen", "uitdelen", "invul"])
      : niv === 2 ? kies(["uitdelen", "invul", "hoeveelkinderen"])
      : kies(["uitdelen", "invul", "hoeveelkinderen"]);
    const kinderen = n + " kinderen";

    if (soort === "uitdelen")
      return uitdeelVraag(totaal, n, plaatje,
        "Verdeel de <b>" + totaal + "</b> " + plaatje + " eerlijk over " + kinderen + "." +
          (niv === 3 ? " Blijft er iets over? Dan laat je het in de schaal." : ""),
        "Ieder kind krijgt er " + ieder + (rest ? ", en er blijft " + rest + " over" : "") + ". Controle: " + reeks(n, () => ieder).join(" + ") + " = " + n * ieder + ".");

    if (soort === "hoeveelkinderen" && !rest)
      return invulVraag("Er zijn <b>" + totaal + "</b> " + plaatje + ". Elk kind krijgt er <b>" + ieder + "</b>. Hoeveel kinderen krijgen er iets?", vlak => {
        vlak.appendChild(dingenRij(totaal, plaatje));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord("kinderen"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [n], "Maak groepjes van " + ieder + ": " + reeks(n, () => ieder).join(" + ") + " = " + totaal + ". Dat zijn " + n + " groepjes, dus " + n + " kinderen.");

    return invulVraag("Verdeel <b>" + totaal + "</b> " + plaatje + " eerlijk over <b>" + kinderen + "</b>.", vlak => {
      vlak.appendChild(dingenRij(totaal, plaatje));
      vlak.appendChild(el("div", { stijl: "font-size:34px;letter-spacing:6px", tekst: reeks(n, i => KINDEREN[i % KINDEREN.length]).join("") }));
      const rij = el("div", { class: "rij" });
      rij.appendChild(woord("Ieder krijgt"));
      rij.appendChild(invoerVak());
      if (rest) { rij.appendChild(woord(". Er blijven")); rij.appendChild(invoerVak()); rij.appendChild(woord("over.")); }
      vlak.appendChild(rij);
      vlak.appendChild(cijferpad());
    }, rest ? [ieder, rest] : [ieder],
    "Deel ze rond, één voor één: ieder krijgt " + ieder + (rest ? " en er blijft " + rest + " over" : "") + ".");
  }
};

/* =========================================================================
   6 en 7. Geld: euro's en centen
   ========================================================================= */
/* alle bedragen in centen: 1, 2, 5, 10, 20, 50, 100, 200 zijn munten, 500 en hoger briefjes */
const MUNT_MM = { 1: 16.25, 2: 18.75, 5: 21.25, 10: 19.75, 20: 22.25, 50: 24.25, 100: 23.25, 200: 25.75 };
const BRIEFJE_KLEUR = { 500: ["#c3c8cd", "#8d959c"], 1000: ["#f4a29a", "#c2554b"], 2000: ["#9dbde8", "#4b7cc2"], 5000: ["#f7c07f", "#c9802c"] };

function geldNaam(c) {
  if (c < 100) return c + " cent";
  if (c <= 200) return c / 100 + " euro";
  return "briefje van " + c / 100 + " euro";
}
/* Een munt of briefje. De munten hebben de echte verhoudingen:
   de munt van 50 cent is groter dan die van 1 euro, maar minder waard. */
function geldPlaatje(c, maat) {
  maat = maat || 64;
  if (c >= 500) {
    const [licht, donker] = BRIEFJE_KLEUR[c];
    const W = 120, H = 64;
    const s = '<rect x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" rx="6" fill="' + licht + '" stroke="' + donker + '" stroke-width="2.5"/>' +
      '<rect x="8" y="8" width="' + (W - 16) + '" height="' + (H - 16) + '" rx="4" fill="none" stroke="' + donker + '" stroke-width="1" opacity=".6"/>' +
      '<path d="M70 50 L70 30 Q82 14 94 30 L94 50 Z" fill="#fff" opacity=".45"/>' +
      '<text x="14" y="36" font-size="26" font-weight="bold" font-family="Trebuchet MS" fill="' + donker + '">' + c / 100 + "</text>" +
      '<text x="14" y="52" font-size="12" font-weight="bold" font-family="Trebuchet MS" fill="' + donker + '">euro</text>';
    const d = svg(s, W, H);
    d.style.width = Math.round(maat * 1.75) + "px"; d.style.display = "inline-block";
    return d;
  }
  const px = Math.round(maat * MUNT_MM[c] / 25.75);
  const r = 48, cx = 50;
  let buiten, binnen, tk = "#5b3d0e";
  if (c <= 5) { buiten = "#c98246"; binnen = "#e0a271"; }
  else if (c < 100) { buiten = "#e0b53c"; binnen = "#f5d97a"; }
  else if (c === 100) { buiten = "#e0b53c"; binnen = "#d9dde2"; tk = "#3d4650"; }
  else { buiten = "#cfd4da"; binnen = "#f0cf6a"; }
  const euro = c >= 100;
  const s = '<circle cx="50" cy="50" r="' + r + '" fill="' + buiten + '" stroke="#7a6a3e" stroke-width="2"/>' +
    '<circle cx="50" cy="50" r="' + (euro ? 34 : 42) + '" fill="' + binnen + '"/>' +
    '<text x="' + cx + '" y="56" text-anchor="middle" font-size="' + (euro ? 36 : 38) + '" font-weight="bold" font-family="Trebuchet MS" fill="' + tk + '">' + (euro ? c / 100 : c) + "</text>" +
    '<text x="' + cx + '" y="76" text-anchor="middle" font-size="15" font-weight="bold" font-family="Trebuchet MS" fill="' + tk + '">' + (euro ? "euro" : "cent") + "</text>";
  const d = svg(s, 100, 100);
  d.style.width = px + "px"; d.style.display = "inline-block"; d.style.verticalAlign = "middle";
  return d;
}

SPELLEN.geldwaarde = {
  titel: "De waarde van geld", emoji: "💶", blok: 2,
  doel: "Ik leer over de waarde van geld",
  maak(niv) {
    const soort = niv === 1 ? kies(["welke", "meeste", "welke"])
      : niv === 2 ? kies(["meeste", "hoeveel", "ordenen", "welke"])
      : kies(["ordenen", "hoeveel", "minste", "meeste"]);

    if (soort === "welke") {
      const doel = kies(niv === 1 ? [100, 200, 500, 1000, 2000] : [100, 200, 50, 500, 1000, 2000, 5000]);
      const pool = doel >= 500 ? [500, 1000, 2000, 5000] : [1, 2, 5, 10, 20, 50, 100, 200];
      /* verwarrende keuzes erbij: 1 euro en 1 cent, 2 euro en 2 cent, 50 cent en 50 euro */
      const lijkt = { 100: [1, 10], 200: [2, 20], 50: [5, 20], 500: [5, 1000], 1000: [10, 500], 2000: [20, 1000], 5000: [50, 2000] };
      const anderen = lijkt[doel].concat(schud(pool.filter(x => x !== doel && lijkt[doel].indexOf(x) < 0))).slice(0, niv === 1 ? 2 : 3);
      const opties = schud([doel].concat(anderen));
      return keuzeVraag({
        opdracht: "Tik op " + (doel >= 500 ? "het <b>" + geldNaam(doel) + "</b>" : "de munt van <b>" + geldNaam(doel) + "</b>") + ".",
        uitleg: "Kijk goed of er <b>euro</b> of <b>cent</b> op staat. 100 cent is 1 euro.",
        opties, goed: opties.indexOf(doel), plaatje: true,
        inhoud(knop, c) { knop.appendChild(geldPlaatje(c, 72)); }
      });
    }

    if (soort === "meeste" || soort === "minste") {
      const meest = soort === "meeste";
      let keus;
      if (niv === 1) keus = verschillendUit([100, 200, 500, 1000, 2000], 3);
      else if (Math.random() < .6) keus = schud([50, 100]).concat(verschillendUit([2, 5, 10, 20, 200], 1));  /* groot is niet altijd meer */
      else keus = verschillendUit([5, 20, 50, 100, 200, 500, 1000, 2000, 5000], niv === 3 ? 4 : 3);
      const doel = meest ? Math.max.apply(null, keus) : Math.min.apply(null, keus);
      const opties = schud(keus);
      return keuzeVraag({
        opdracht: "Wat is het <b>" + (meest ? "meeste" : "minste") + "</b> geld waard?",
        uitleg: "Het gaat om wat erop staat, niet om hoe groot de munt is. Van weinig naar veel: " +
          opties.slice().sort((a, b) => a - b).map(geldNaam).join(", ") + ".",
        opties, goed: opties.indexOf(doel), plaatje: true,
        inhoud(knop, c) { knop.appendChild(geldPlaatje(c, 76)); }
      });
    }

    if (soort === "hoeveel") {
      const paren = niv === 2
        ? [[50, 100], [10, 100], [100, 200], [500, 1000], [1000, 2000], [100, 500], [200, 1000]]
        : [[20, 100], [10, 100], [5, 50], [200, 1000], [500, 2000], [1000, 5000], [50, 200], [100, 1000]];
      const [klein, groot] = kies(paren);
      const aantal = groot / klein;
      const bedrag = c => c < 100 ? c + " cent" : c / 100 + " euro";
      return invulVraag("Hoeveel " + (klein >= 500 ? "briefjes" : "munten") + " van <b>" + bedrag(klein) + "</b> heb je nodig voor " +
        (groot >= 500 ? "een briefje van " : "") + "<b>" + bedrag(groot) + "</b>?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:16px" });
        rij.appendChild(geldPlaatje(groot, 90));
        rij.appendChild(woord("=", 34));
        rij.appendChild(invoerVak());
        rij.appendChild(woord("keer", 24));
        rij.appendChild(geldPlaatje(klein, 90));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [aantal], reeks(aantal, () => (klein < 100 ? klein : klein / 100)).join(" + ") + " = " +
        (groot < 100 ? groot + " cent" : (klein < 100 ? groot + " cent = " : "") + groot / 100 + " euro") + ".");
    }

    /* ordenen: van weinig naar veel aantikken */
    const keus = niv === 2 ? verschillendUit([10, 20, 50, 100, 200, 500, 1000], 3)
      : verschillendUit([5, 10, 20, 50, 100, 200, 500, 1000, 2000], 4);
    if (keus.indexOf(50) < 0 && keus.indexOf(100) < 0 && Math.random() < .5) keus[0] = 50;
    const goedeVolgorde = keus.slice().sort((a, b) => a - b);
    const getikt = [];
    let knoppen = [];
    const werkbij = () => knoppen.forEach((k, i) => {
      const plek = getikt.indexOf(i);
      k.querySelector(".nummer").textContent = plek >= 0 ? plek + 1 : "";
      k.classList.toggle("gekozen", plek >= 0);
    });
    return {
      opdracht: "Tik het geld aan <b>van weinig naar veel</b>. Eerst het minste, als laatste het meeste.",
      uitleg: goedeVolgorde.map(geldNaam).join(" → ") + ".",
      bouw(vlak) {
        const rij = el("div", { class: "rij", stijl: "gap:18px;align-items:center" });
        knoppen = keus.map((c, i) => {
          const k = el("button", { class: "keuze plaatje ordenknop", type: "button" });
          k.appendChild(el("span", { class: "nummer" }));
          k.appendChild(geldPlaatje(c, 76));
          k.addEventListener("click", () => {
            const plek = getikt.indexOf(i);
            if (plek >= 0) getikt.splice(plek, 1); else getikt.push(i);
            Geluid.klik(); werkbij();
          });
          rij.appendChild(k);
          return k;
        });
        vlak.appendChild(rij);
        vlak.appendChild(el("div", { class: "label", tekst: "Tik nog een keer om een nummer weg te halen." }));
      },
      check() { return getikt.length === keus.length && getikt.every((i, k) => keus[i] === goedeVolgorde[k]); },
      herstel() { getikt.length = 0; werkbij(); },
      toon() {
        getikt.length = 0;
        goedeVolgorde.forEach(c => getikt.push(keus.indexOf(c)));
        werkbij();
      }
    };
  }
};
function verschillendUit(lijst, n) { return schud(lijst).slice(0, n); }

const WINKEL = [
  ["🧸", "beer", "de"], ["⚽", "bal", "de"], ["📚", "boek", "het"], ["🎨", "verfdoos", "de"],
  ["🧩", "puzzel", "de"], ["🎒", "rugzak", "de"], ["🦖", "dino", "de"], ["🚗", "auto", "de"],
  ["🎁", "cadeautje", "het"], ["🍦", "ijsje", "het"], ["👑", "kroon", "de"], ["🎀", "strik", "de"]
];
const deDing = d => d[2] + " " + d[1];
function winkelDing(ding, euro) {
  const d = el("div", { stijl: "display:flex;flex-direction:column;align-items:center;gap:2px" });
  d.appendChild(el("div", { stijl: "font-size:52px;line-height:1", tekst: ding[0] }));
  d.appendChild(el("div", { class: "prijskaartje", tekst: euro + " euro" }));
  return d;
}
/* bedrag in euro's opbouwen uit munten en briefjes, groot naar klein */
function inGeld(euro, stukken) {
  const r = [];
  stukken.slice().sort((a, b) => b - a).forEach(s => { while (euro * 100 >= s) { r.push(s); euro -= s / 100; } });
  return r;
}

SPELLEN.rekengeld = {
  titel: "Rekenen met geld", emoji: "🛒", blok: 2,
  doel: "Ik reken met geld",
  maak(niv) {
    const max = niv === 1 ? 20 : niv === 2 ? 50 : 100;
    const soort = niv === 1 ? kies(["tellen", "betalen", "samen"])
      : niv === 2 ? kies(["tellen", "betalen", "samen", "terug"])
      : kies(["betalen", "samen", "terug", "genoeg"]);
    const [d1, d2] = schud(WINKEL);

    if (soort === "tellen") {
      const stukken = niv === 1 ? [100, 200, 500, 1000] : [100, 200, 500, 1000, 2000];
      const aantal = niv === 1 ? rnd(2, 4) : rnd(3, 5);
      let gekozen, som, poging = 0;
      do {
        gekozen = reeks(aantal, () => kies(stukken)).sort((a, b) => b - a);
        som = gekozen.reduce((a, b) => a + b, 0) / 100;
      } while (som > max && poging++ < 50);
      return invulVraag("Hoeveel euro is dit samen?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:12px" });
        gekozen.forEach(c => rij.appendChild(geldPlaatje(c, 76)));
        vlak.appendChild(rij);
        const r2 = el("div", { class: "rij" });
        r2.appendChild(invoerVak());
        r2.appendChild(woord("euro"));
        vlak.appendChild(r2);
        vlak.appendChild(cijferpad());
      }, [som], "Begin bij het grootste: " + gekozen.map(c => c / 100).join(" + ") + " = " + som + " euro.");
    }

    if (soort === "samen") {
      const p1 = rnd(2, Math.floor(max / 2)), p2 = rnd(2, max - p1);
      return invulVraag("Je koopt " + deDing(d1) + " en " + deDing(d2) + ". Hoeveel moet je samen betalen?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:40px" });
        rij.appendChild(winkelDing(d1, p1));
        rij.appendChild(woord("+", 34));
        rij.appendChild(winkelDing(d2, p2));
        vlak.appendChild(rij);
        const r2 = el("div", { class: "rij" });
        r2.appendChild(woord("Samen"));
        r2.appendChild(invoerVak());
        r2.appendChild(woord("euro"));
        vlak.appendChild(r2);
        vlak.appendChild(cijferpad());
      }, [p1 + p2], p1 + " + " + p2 + " = " + (p1 + p2) + " euro.");
    }

    if (soort === "terug") {
      const briefje = niv === 2 ? kies([10, 20]) : kies([20, 50]);
      const prijs = rnd(Math.max(2, Math.round(briefje / 5)), briefje - 1);
      return invulVraag("Je koopt " + deDing(d1) + " en betaalt met een <b>briefje van " + briefje +
        " euro</b>. Hoeveel geld krijg je terug?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:40px" });
        rij.appendChild(winkelDing(d1, prijs));
        rij.appendChild(geldPlaatje(briefje * 100, 80));
        vlak.appendChild(rij);
        const r2 = el("div", { class: "rij" });
        r2.appendChild(woord("Je krijgt"));
        r2.appendChild(invoerVak());
        r2.appendChild(woord("euro terug"));
        vlak.appendChild(r2);
        vlak.appendChild(cijferpad());
      }, [briefje - prijs], briefje + " − " + prijs + " = " + (briefje - prijs) + " euro. Of tel verder vanaf " + prijs + " tot " + briefje + ".");
    }

    if (soort === "genoeg") {
      const p1 = rnd(5, 30), p2 = rnd(5, 30), heb = kies([20, 30, 40, 50]);
      const kan = p1 + p2 <= heb;
      const opties = ["Ja, dat kan", "Nee, te weinig"];
      return keuzeVraag({
        opdracht: "Je hebt <b>" + heb + " euro</b>. Kun je " + deDing(d1) + " én " + deDing(d2) + " allebei kopen?",
        uitleg: "Samen kost het " + p1 + " + " + p2 + " = " + (p1 + p2) + " euro. Dat is " +
          (kan ? (p1 + p2 === heb ? "precies " + heb + " euro, dus het kan." : "minder dan " + heb + " euro, dus het kan.") : "meer dan " + heb + " euro, dus het kan niet."),
        opties, goed: kan ? 0 : 1,
        boven(vlak) {
          const rij = el("div", { class: "rij", stijl: "gap:40px" });
          rij.appendChild(winkelDing(d1, p1));
          rij.appendChild(winkelDing(d2, p2));
          vlak.appendChild(rij);
        },
        inhoud(knop, t) { knop.textContent = t; }
      });
    }

    /* precies betalen met munten en briefjes */
    const prijs = rnd(niv === 1 ? 3 : 8, max - (niv === 3 ? 5 : 1));
    const stukken = niv === 3 ? [100, 200, 500, 1000, 2000, 5000] : [100, 200, 500, 1000, 2000];
    let inBak = [];
    return {
      opdracht: "Betaal " + deDing(d1) + ". Het kost <b>" + prijs + " euro</b>. Tik of sleep het geld naar de toonbank.",
      uitleg: "Bijvoorbeeld: " + inGeld(prijs, stukken).map(c => c / 100).join(" + ") + " = " + prijs + " euro.",
      bouw(vlak) {
        const boven = el("div", { class: "rij", stijl: "gap:24px" });
        boven.appendChild(winkelDing(d1, prijs));
        const teller = el("div", { class: "label", stijl: "font-size:20px;color:#12293d;font-weight:bold" });
        boven.appendChild(teller);
        const bak = el("div", { class: "bak", stijl: "width:100%;max-width:680px" });
        const werkbij = () => {
          const s = inBak.reduce((a, b) => a + b, 0) / 100;
          teller.textContent = "Op de toonbank: " + s + " euro";
          teller.style.color = s === prijs ? "#15a24a" : "#12293d";
        };
        dropzone(bak, (bron, waarde) => {
          if (inBak.length >= 14) return;
          const m = geldPlaatje(waarde, 56);
          m.style.cursor = "pointer"; m.title = "Tik om terug te leggen";
          m.addEventListener("click", () => {
            m.remove();
            const i = inBak.indexOf(waarde); if (i >= 0) inBak.splice(i, 1);
            werkbij();
          });
          bak.appendChild(m); inBak.push(waarde); werkbij(); Geluid.klik();
        });
        vlak.appendChild(boven);
        vlak.appendChild(el("div", { class: "label", tekst: "↓ toonbank (tik op geld om het terug te leggen)" }));
        vlak.appendChild(bak);
        werkbij();
        const voorraad = el("div", { class: "voorraad", stijl: "align-items:center" });
        stukken.forEach(w => {
          const m = geldPlaatje(w, 64);
          sleepbaar(m, w, { kopie: true, opKlik: () => bak._opDrop(null, w) });
          voorraad.appendChild(m);
        });
        vlak.appendChild(voorraad);
      },
      check() { return inBak.reduce((a, b) => a + b, 0) === prijs * 100; }
    };
  }
};

/* =========================================================================
   8. Tabellen en diagrammen
   ========================================================================= */
const DIAGRAM_ONDERWERPEN = [
  { vraag: "Welk fruit vind jij het lekkerst?", items: [["🍎", "appel"], ["🍌", "banaan"], ["🍓", "aardbei"], ["🍐", "peer"], ["🍇", "druiven"]] },
  { vraag: "Welk huisdier vind jij het leukst?", items: [["🐱", "kat"], ["🐶", "hond"], ["🐰", "konijn"], ["🐟", "vis"], ["🐹", "hamster"]] },
  { vraag: "Welk ijsje vind jij het lekkerst?", items: [["🍓", "aardbei"], ["🍫", "chocola"], ["🍋", "citroen"], ["🍦", "vanille"]] },
  { vraag: "Welke sport doe jij het liefst?", items: [["⚽", "voetbal"], ["🏊", "zwemmen"], ["🎾", "tennis"], ["🚴", "fietsen"], ["🤸", "turnen"]] }
];
const STAAFKLEUREN = ["#ff85b3", "#6aa8ff", "#ffc04d", "#5cc98a", "#b28cf0"];

function pictogram(items, waarden, perPlaatje) {
  const t = el("div", { stijl: "display:grid;grid-template-columns:auto 1fr;gap:6px 14px;align-items:center;background:#fbfdff;border:3px solid #cddcea;border-radius:16px;padding:10px 16px" });
  items.forEach((it, i) => {
    t.appendChild(el("div", { stijl: "font-size:18px;font-weight:bold", tekst: it[0] + " " + it[1] }));
    t.appendChild(el("div", { stijl: "font-size:24px;letter-spacing:2px", tekst: reeks(waarden[i] / perPlaatje, () => "🙂").join("") }));
  });
  return t;
}
function staafdiagram(items, waarden, top) {
  const stapLabel = top > 10 ? 2 : 1;
  const W = 110 + items.length * 90, H = 316, onder = 250, links = 50, hoog = 220;
  const yVan = v => onder - v / top * hoog;
  let s = "";
  for (let v = 0; v <= top; v++) {
    s += '<line x1="' + links + '" y1="' + yVan(v) + '" x2="' + (W - 20) + '" y2="' + yVan(v) + '" stroke="' + (v % stapLabel ? "#eef2f6" : "#d6e0ea") + '" stroke-width="1.5"/>';
    if (v % stapLabel === 0) s += '<text x="' + (links - 10) + '" y="' + (yVan(v) + 6) + '" text-anchor="end" font-size="16" font-family="Trebuchet MS" fill="#43263a">' + v + "</text>";
  }
  s += '<line x1="' + links + '" y1="' + (onder - hoog - 6) + '" x2="' + links + '" y2="' + onder + '" stroke="#43263a" stroke-width="3"/>';
  s += '<line x1="' + links + '" y1="' + onder + '" x2="' + (W - 20) + '" y2="' + onder + '" stroke="#43263a" stroke-width="3"/>';
  items.forEach((it, i) => {
    const x = links + 30 + i * 90;
    s += '<rect x="' + x + '" y="' + yVan(waarden[i]) + '" width="50" height="' + (onder - yVan(waarden[i])) + '" fill="' + STAAFKLEUREN[i] + '" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>';
    s += '<text x="' + (x + 25) + '" y="' + (onder + 34) + '" text-anchor="middle" font-size="28">' + it[0] + "</text>";
    s += '<text x="' + (x + 25) + '" y="' + (onder + 56) + '" text-anchor="middle" font-size="15" font-family="Trebuchet MS" fill="#43263a">' + it[1] + "</text>";
  });
  const d = svg(s, W, H + 10);
  d.style.maxWidth = Math.round(W * 1.4) + "px";   /* mag groter getekend worden dan de viewBox */
  return d;
}
/* turfjes: per vijf vier streepjes met een schuine erdoor */
function turfjes(n) {
  let s = "", x = 4;
  for (let g = 0; g < n; g += 5) {
    const inGroep = Math.min(5, n - g);
    for (let i = 0; i < Math.min(4, inGroep); i++) s += '<line x1="' + (x + i * 9) + '" y1="4" x2="' + (x + i * 9) + '" y2="34" stroke="#43263a" stroke-width="3" stroke-linecap="round"/>';
    if (inGroep === 5) s += '<line x1="' + (x - 4) + '" y1="30" x2="' + (x + 31) + '" y2="8" stroke="#43263a" stroke-width="3" stroke-linecap="round"/>';
    x += 50;
  }
  const W = Math.max(60, x);
  const d = svg(s, W, 38);
  d.style.width = W + "px";
  return d;
}

SPELLEN.diagram = {
  titel: "Tabellen en diagrammen", emoji: "📊", blok: 2,
  doel: "Ik leer tabellen en diagrammen gebruiken",
  maak(niv) {
    const ond = kies(DIAGRAM_ONDERWERPEN);
    const aantalItems = niv === 1 ? 3 : 4;
    const items = schud(ond.items).slice(0, aantalItems);
    const vorm = niv === 1 ? "picto" : niv === 2 ? kies(["staaf", "staaf", "turf", "picto"]) : kies(["staaf", "turf", "picto2", "staaf"]);
    const perPlaatje = vorm === "picto2" ? 2 : 1;
    const top = niv === 1 ? 6 : niv === 2 ? 10 : 16;
    const waarden = verschillend(aantalItems, 1, top / perPlaatje).map(v => v * perPlaatje);
    const naam = i => items[i][0] + " " + items[i][1];

    const plaatje = () => {
      const d = el("div", { stijl: "display:flex;flex-direction:column;align-items:center;gap:6px;width:100%" });
      d.appendChild(el("div", { class: "label", html: "Groep 4 kreeg de vraag: <b>" + ond.vraag + "</b>" }));
      if (vorm === "staaf") d.appendChild(staafdiagram(items, waarden, top));
      else d.appendChild(pictogram(items, waarden, perPlaatje));
      if (vorm === "picto2") d.appendChild(el("div", { class: "label", html: "<b>🙂 = 2 kinderen</b>" }));
      else if (vorm === "picto") d.appendChild(el("div", { class: "label", tekst: "🙂 = 1 kind" }));
      return d;
    };

    if (vorm === "turf") {
      /* turftabel: de turfjes tellen en het getal in de tabel zetten */
      return invulVraag("De kinderen hebben geturfd. Tel de turfjes en schrijf het getal in de tabel.", vlak => {
        vlak.appendChild(el("div", { class: "label", html: "Groep 4 kreeg de vraag: <b>" + ond.vraag + "</b>" }));
        const t = el("table", { class: "turftabel" });
        t.appendChild(el("tr", {}, [el("th", { tekst: "" }), el("th", { tekst: "turfjes" }), el("th", { tekst: "aantal" })]));
        items.forEach((it, i) => {
          const tr = el("tr");
          tr.appendChild(el("td", { tekst: it[0] + " " + it[1] }));
          const td = el("td"); td.appendChild(turfjes(waarden[i])); tr.appendChild(td);
          const td2 = el("td"); td2.appendChild(invoerVak()); tr.appendChild(td2);
          t.appendChild(tr);
        });
        vlak.appendChild(t);
        vlak.appendChild(cijferpad());
      }, waarden, "Elk bosje met een streep erdoor is 5. " + items.map((it, i) => it[1] + ": " + waarden[i]).join(", ") + ".");
    }

    const vragen = niv === 1 ? ["hoeveel", "meeste", "minste"] : niv === 2 ? ["hoeveel", "meeste", "verschil", "minste"] : ["verschil", "samen", "hoeveel", "meeste"];
    const vraag = kies(vragen);

    if (vraag === "meeste" || vraag === "minste") {
      const meest = vraag === "meeste";
      const doel = waarden.indexOf(meest ? Math.max.apply(null, waarden) : Math.min.apply(null, waarden));
      const opties = reeks(aantalItems);
      return keuzeVraag({
        opdracht: "Wat kozen de <b>" + (meest ? "meeste" : "minste") + "</b> kinderen?",
        uitleg: items[doel][1] + ": " + waarden[doel] + " kinderen. " + (vorm === "staaf" ? "Dat is de " + (meest ? "hoogste" : "laagste") + " staaf." : "Dat is de " + (meest ? "langste" : "kortste") + " rij."),
        opties, goed: doel,
        boven(vlak) { vlak.appendChild(plaatje()); },
        inhoud(knop, i) { knop.textContent = naam(i); }
      });
    }
    const invulMet = (opdracht, antwoord, uitleg) => invulVraag(opdracht, vlak => {
      vlak.appendChild(plaatje());
      const rij = el("div", { class: "rij" });
      rij.appendChild(invoerVak());
      rij.appendChild(woord("kinderen"));
      vlak.appendChild(rij);
      vlak.appendChild(cijferpad());
    }, [antwoord], uitleg);

    if (vraag === "verschil") {
      const [a, b] = schud(reeks(aantalItems)).slice(0, 2).sort((x, y) => waarden[y] - waarden[x]);
      return invulMet("Hoeveel kinderen <b>meer</b> kozen " + naam(a) + " dan " + naam(b) + "?", waarden[a] - waarden[b],
        items[a][1] + ": " + waarden[a] + ", " + items[b][1] + ": " + waarden[b] + ". " + waarden[a] + " − " + waarden[b] + " = " + (waarden[a] - waarden[b]) + ".");
    }
    if (vraag === "samen") {
      const som = waarden.reduce((x, y) => x + y, 0);
      return invulMet("Hoeveel kinderen hebben er <b>in totaal</b> gekozen?", som, waarden.join(" + ") + " = " + som + ".");
    }
    const i = rnd(0, aantalItems - 1);
    return invulMet("Hoeveel kinderen kozen <b>" + naam(i) + "</b>?", waarden[i],
      vorm === "staaf" ? "Kijk hoe hoog de staaf komt en lees het getal links af: " + waarden[i] + "."
        : vorm === "picto2" ? "Elk gezichtje is 2 kinderen: " + reeks(waarden[i] / 2, () => 2).join(" + ") + " = " + waarden[i] + "."
        : "Tel de gezichtjes: " + waarden[i] + ".");
  }
};

/* =========================================================================
   9. Verdelen tot en met 100
   ========================================================================= */
/* Uitdelen met tienstaven en losse blokjes. Onder elk bordje een knop voor
   een staaf en een knop voor een blokje; tik op een stuk om het terug te leggen. */
function mabUitdeelVraag(totaal, n, opdracht, uitleg, metWissel, toonWaarde) {
  let doosT = Math.floor(totaal / 10), doosE = totaal % 10;
  let bord = reeks(n, () => ({ t: 0, e: 0 }));
  let teken = null;
  return {
    opdracht, uitleg,
    bouw(vlak) {
      const doos = el("div", { class: "voorraad", stijl: "align-items:flex-end;min-height:70px;max-width:720px" });
      const bordjes = el("div", { class: "rij", stijl: "gap:12px;align-items:flex-start" });
      teken = () => {
        doos.innerHTML = "";
        doos.appendChild(el("span", { class: "label", stijl: "align-self:center", tekst: "In de doos:" }));
        for (let i = 0; i < doosT; i++) doos.appendChild(tienstaaf(60));
        const los = el("div", { stijl: "display:flex;flex-wrap:wrap;gap:3px;max-width:110px;align-items:flex-end" });
        for (let i = 0; i < doosE; i++) los.appendChild(losblokje(16));
        doos.appendChild(los);
        if (!doosT && !doosE) doos.appendChild(el("span", { class: "label", stijl: "align-self:center", tekst: "leeg" }));
        if (metWissel && doosT > 0) doos.appendChild(el("button", {
          class: "knop stil", type: "button", tekst: "🔄 1 staaf → 10 blokjes", stijl: "align-self:center;font-size:15px;padding:8px 12px",
          onclick: () => { doosT--; doosE += 10; Geluid.klik(); teken(); }
        }));
        bordjes.innerHTML = "";
        bord.forEach((b, i) => {
          const kolom = el("div", { stijl: "display:flex;flex-direction:column;align-items:center;gap:4px" });
          kolom.appendChild(el("div", { stijl: "font-size:30px;line-height:1", tekst: KINDEREN[i % KINDEREN.length] }));
          const mat = el("div", { class: "bak", stijl: "width:clamp(116px,15vw,160px);min-height:clamp(80px,13vh,110px);align-items:flex-end;gap:3px;padding:6px" });
          for (let j = 0; j < b.t; j++) {
            const st = tienstaaf(60); st.style.cursor = "pointer";
            st.addEventListener("click", () => { b.t--; doosT++; Geluid.klik(); teken(); });
            mat.appendChild(st);
          }
          const los2 = el("div", { stijl: "display:flex;flex-wrap:wrap;gap:3px;max-width:62px" });
          for (let j = 0; j < b.e; j++) {
            const bl = losblokje(16); bl.style.cursor = "pointer";
            bl.addEventListener("click", () => { b.e--; doosE++; Geluid.klik(); teken(); });
            los2.appendChild(bl);
          }
          mat.appendChild(los2);
          kolom.appendChild(mat);
          if (toonWaarde) kolom.appendChild(el("div", { class: "label", stijl: "font-weight:bold;color:#43263a", tekst: String(b.t * 10 + b.e) }));
          const knoppen = el("div", { stijl: "display:flex;gap:6px" });
          knoppen.appendChild(el("button", {
            class: "knop stil", type: "button", tekst: "+10", stijl: "padding:6px 12px;font-size:16px",
            onclick: () => { if (!doosT) return; doosT--; b.t++; Geluid.klik(); teken(); }
          }));
          knoppen.appendChild(el("button", {
            class: "knop stil", type: "button", tekst: "+1", stijl: "padding:6px 12px;font-size:16px",
            onclick: () => { if (!doosE) return; doosE--; b.e++; Geluid.klik(); teken(); }
          }));
          kolom.appendChild(knoppen);
          bordjes.appendChild(kolom);
        });
      };
      vlak.appendChild(doos);
      vlak.appendChild(bordjes);
      teken();
    },
    check() {
      const w = bord.map(b => b.t * 10 + b.e);
      return doosT === 0 && doosE === 0 && w.every(x => x === w[0]);
    },
    toon() {
      const ieder = totaal / n;
      bord = reeks(n, () => ({ t: Math.floor(ieder / 10), e: ieder % 10 }));
      doosT = 0; doosE = 0;
      if (teken) teken();
    }
  };
}
SPELLEN.verdelen100 = {
  titel: "Verdelen tot 100", emoji: "🧺", blok: 2,
  doel: "Ik verdeel hoeveelheden tot en met 100",
  maak(niv) {
    let n, ieder, poging = 0;
    if (niv === 1) {
      n = rnd(2, 4);
      ieder = rnd(1, Math.floor(10 / n)) * 10;
    } else if (niv === 2) {
      n = rnd(2, 4);
      ieder = rnd(1, Math.floor(9 / n)) * 10 + rnd(1, Math.floor(9 / n));
    } else {
      /* hier moet je een staaf inwisselen voor losse blokjes */
      do { n = rnd(2, 4); ieder = rnd(11, Math.floor(99 / n)); poging++; }
      while ((Math.floor(n * ieder / 10) % n === 0) && poging < 60);
    }
    const totaal = n * ieder;
    const soort = niv === 1 ? kies(["uitdelen", "uitdelen", "helft"]) : kies(["uitdelen", "helft", "verhaal"]);
    const kinderen = n + " kinderen";

    if (soort === "helft") {
      const getal = niv === 1 ? kies([20, 40, 60, 80, 100]) : niv === 2 ? kies([30, 50, 70, 90, 22, 44, 66, 88, 48, 64]) : kies([32, 34, 36, 38, 52, 54, 56, 58, 72, 74, 76, 78, 96, 94]);
      const helft = getal / 2;
      const vraag = invulVraag("Wat is de <b>helft</b> van " + getal + "?", vlak => {
        vlak.appendChild(somRij(["De helft van " + getal, "=", "?"]));
        vlak.appendChild(cijferpad());
      }, [helft], "Verdeel " + getal + " over 2: ieder krijgt " + helft + ". Kijk maar: " + helft + " + " + helft + " = " + getal + ".");
      vraag.hulp = () => {
        const d = el("div", { class: "hulpvak" });
        d.appendChild(el("div", { class: "label", tekst: getal + " met blokken. Verdeel de staven, en wissel zo nodig een staaf voor 10 losse blokjes." }));
        d.appendChild(mabPlaatje(Math.floor(getal / 10), getal % 10));
        return d;
      };
      return vraag;
    }

    if (soort === "verhaal") {
      const v = kies([["stickers", "groepjes"], ["knikkers", "kinderen"], ["kralen", "kettingen"], ["kaartjes", "kinderen"], ["plantjes", "bakken"]]);
      return invulVraag("Er zijn <b>" + totaal + " " + v[0] + "</b>. Ze worden eerlijk verdeeld over <b>" + n + " " + v[1] + "</b>. Hoeveel " + v[0] + " zijn er voor elk?", vlak => {
        vlak.appendChild(mabPlaatje(Math.floor(totaal / 10), totaal % 10));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord("Elk krijgt"));
        rij.appendChild(invoerVak());
        rij.appendChild(woord(v[0]));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [ieder], "Verdeel eerst de tientallen, dan de losse: ieder krijgt " + ieder + ". Controle: " + reeks(n, () => ieder).join(" + ") + " = " + totaal + ".");
    }

    return mabUitdeelVraag(totaal, n,
      "Verdeel <b>" + totaal + "</b> eerlijk over " + kinderen + ". Gebruik de knoppen +10 en +1 onder de matjes." +
        (niv === 3 ? " Zijn er niet genoeg staven? Wissel er een om." : ""),
      "Ieder krijgt " + ieder + ". " + reeks(n, () => ieder).join(" + ") + " = " + totaal + ".",
      niv === 3, niv === 1);
  }
};

/* =========================================================================
   10. Patronen spiegelen
   ========================================================================= */
const SPIEGELKLEUREN = ["#fff7fb", "#ff85b3", "#6aa8ff"];
function maakPatroon(R, C, kleuren, liggend) {
  let p, poging = 0;
  do {
    p = reeks(R, () => reeks(C, () => Math.random() < .42 ? rnd(1, kleuren) : 0));
    poging++;
    const vol = p.flat().filter(x => x).length;
    /* niet te leeg, niet te vol, en niet al symmetrisch (anders zie je het verschil tussen schuiven en spiegelen niet) */
    const symmetrisch = liggend ? p.every((r, i) => r.every((v, c) => v === p[R - 1 - i][c]))
                                : p.every(r => r.every((v, c) => v === r[C - 1 - c]));
    if (vol >= Math.max(3, Math.round(R * C * .3)) && vol <= R * C - 2 && !symmetrisch) break;
  } while (poging < 200);
  return p;
}
function spiegelRooster(p, klik) {
  const R = p.length, C = p[0].length;
  const g = el("div", { class: "spiegelrooster", stijl: "grid-template-columns:repeat(" + C + ",var(--cel))" });
  const cellen = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const cel = el("div", { class: "spiegelcel" + (klik ? " tikbaar" : ""), stijl: "background:" + SPIEGELKLEUREN[p[r][c]] });
    if (klik) cel.addEventListener("click", () => klik(r, c, cel));
    cellen.push(cel);
    g.appendChild(cel);
  }
  g._cellen = cellen;
  return g;
}
SPELLEN.spiegelen = {
  titel: "Patronen spiegelen", emoji: "🦋", blok: 2,
  doel: "Ik leer patronen spiegelen",
  maak(niv) {
    const liggend = niv === 3 && Math.random() < .5;   /* spiegel horizontaal: onder de lijn aanvullen */
    const kleuren = niv === 3 ? 2 : 1;
    const R = liggend ? 3 : niv === 1 ? 4 : 5;
    const C = liggend ? 6 : niv === 1 ? 3 : 4;
    const links = maakPatroon(R, C, kleuren, liggend);
    const spiegel = liggend ? links.slice().reverse() : links.map(r => r.slice().reverse());

    if (!liggend && niv < 3 && Math.random() < .35) {
      /* kiezen: welke kant is het spiegelbeeld? */
      const geschoven = links.map(r => r.slice());
      const eentjeAnders = spiegel.map(r => r.slice());
      const rr = rnd(0, R - 1), cc = rnd(0, C - 1);
      eentjeAnders[rr][cc] = eentjeAnders[rr][cc] ? 0 : 1;
      const opties = schud([spiegel, geschoven, eentjeAnders]);
      return keuzeVraag({
        opdracht: "De rode lijn is een spiegel. Welk plaatje hoort er aan de andere kant?",
        uitleg: "In een spiegel draait alles om: wat links dicht bij de lijn zit, zit rechts ook dicht bij de lijn.",
        opties, goed: opties.indexOf(spiegel), plaatje: true,
        boven(vlak) {
          const rij = el("div", { class: "spiegelrij" });
          rij.appendChild(spiegelRooster(links));
          rij.appendChild(el("div", { class: "spiegellijn" }));
          rij.appendChild(el("div", { class: "spiegelleeg", stijl: "width:calc(" + C + " * var(--cel) + " + (C - 1) + " * 3px)" }));
          vlak.appendChild(rij);
        },
        inhoud(knop, o) { knop.style.setProperty("--cel", "26px"); knop.appendChild(spiegelRooster(o)); }
      });
    }

    let rechts = reeks(R, () => reeks(C, () => 0));
    let rooster = null;
    const zet = (r, c, cel) => {
      rechts[r][c] = (rechts[r][c] + 1) % (kleuren + 1);
      cel.style.background = SPIEGELKLEUREN[rechts[r][c]];
      Geluid.klik();
    };
    return {
      opdracht: liggend
        ? "De rode lijn is een spiegel. Maak het patroon onder de lijn af."
        : "De rode lijn is een spiegel. Maak de andere kant af." + (kleuren > 1 ? " Tik vaker om de kleur te wisselen." : ""),
      uitleg: "Wat vlak bij de spiegel zit, zit aan de andere kant ook vlak bij de spiegel. Het patroon draait om.",
      bouw(vlak) {
        const rij = el("div", { class: "spiegelrij" + (liggend ? " liggend" : "") });
        rij.appendChild(spiegelRooster(links));
        rij.appendChild(el("div", { class: "spiegellijn" }));
        rooster = spiegelRooster(rechts, zet);
        rij.appendChild(rooster);
        vlak.appendChild(rij);
        vlak.appendChild(el("div", { class: "label", tekst: kleuren > 1 ? "Tik op een hokje: roze, blauw, leeg." : "Tik op een hokje om het te kleuren. Nog een keer tikken maakt het weer leeg." }));
      },
      check() { return rechts.every((r, i) => r.every((v, c) => v === spiegel[i][c])); },
      toon() {
        if (!rooster) return;
        rooster._cellen.forEach((cel, k) => {
          const r = Math.floor(k / C), c = k % C;
          if (rechts[r][c] !== spiegel[r][c]) cel.classList.add("verbeterd");
          rechts[r][c] = spiegel[r][c];
          cel.style.background = SPIEGELKLEUREN[spiegel[r][c]];
        });
      }
    };
  }
};

/* De tien lesdoelen van blok 2, in de volgorde van de poster. */
const SPELVOLGORDE_BLOK2 = ["overtiental", "kubus", "herhaald2", "klok", "verdelen", "geldwaarde", "rekengeld", "diagram", "verdelen100", "spiegelen"];
