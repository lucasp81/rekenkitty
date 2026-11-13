/* =========================================================================
   spellen3.js - een vraaggenerator per lesdoel van groep 4, blok 3

   Volgens de brief van de juf:
     - verder met optellen en aftrekken tot en met 100
     - klokkijken met kwartieren
     - de tafels van 2, 5 en 10, en later in het blok de tafel van 3
     - omtrek
     - halveren en verdubbelen van hoeveelheden
     - kilogram en gram

   De lesdoelen komen niet allemaal tegelijk. Eerst de tafels, plus en min tot
   100 en verdubbelen/halveren; daarna komt er om de paar rondes een nieuw
   lesdoel bij (zie BLOK3_VOLGORDE). De tafel van 3 komt als laatste.

   Gebruikt de bouwstenen uit kern.js en hulpjes uit spellen.js en spellen2.js
   (groepjes, mabPlaatje, reeksVraag, woord, somRij, klokPlaatje, ...).
   ========================================================================= */
"use strict";

/* Volgorde waarin de lesdoelen van blok 3 vrijkomen, en na hoeveel afgeronde
   rondes (geteld vanaf de eerste ronde met blok 3). */
const BLOK3_VOLGORDE = [
  ["tafels", 0], ["plus100", 0], ["dubbel", 0],
  ["kwartier", 2], ["gewicht", 4], ["omtrek", 7], ["tafel3", 12]
];
const SPELVOLGORDE_BLOK3 = BLOK3_VOLGORDE.map(x => x[0]);

const Blok3 = {
  aantalOpen() {
    const r = Voortgang.blok3Rondes();
    const open = BLOK3_VOLGORDE.filter(x => x[1] <= r).length + Voortgang.blok3Extra;
    return Math.min(BLOK3_VOLGORDE.length, open);
  },
  open() { return SPELVOLGORDE_BLOK3.slice(0, this.aantalOpen()); },
  isOpen(id) { return this.open().includes(id); },
  /* nog zoveel rondes tot dit lesdoel vrijkomt (alleen zinnig als het nog dicht is) */
  rondesTot(id) {
    const i = SPELVOLGORDE_BLOK3.indexOf(id) - Voortgang.blok3Extra;
    if (i < 0) return 0;
    return Math.max(1, BLOK3_VOLGORDE[i][1] - Voortgang.blok3Rondes());
  }
};

/* =========================================================================
   1 en 2. De tafels (2, 5, 10) en de tafel van 3
   ========================================================================= */
const BALLONKLEUREN = ["#ff6fa5", "#6aa8ff", "#ffad42", "#4fc285", "#b28cf0", "#ff7272", "#3fbcd4", "#e6b400"];

/* verhaaltjes per tafel: [plaatje dat n keer getoond wordt, opdracht(n), eenheid] */
const TAFELVERHALEN = {
  2: [
    ["🐱", n => n + " poesjes hebben elk 2 oogjes. Hoeveel oogjes zijn dat samen?", "oogjes"],
    ["🧦", n => "Er liggen " + n + " paar sokken. Een paar is 2 sokken. Hoeveel sokken zijn het?", "sokken"],
    ["🚲", n => "Er staan " + n + " fietsen. Elke fiets heeft 2 wielen. Hoeveel wielen zijn dat?", "wielen"]
  ],
  3: [
    ["🍀", n => "Je vindt " + n + " klavertjes drie. Elk klavertje heeft 3 blaadjes. Hoeveel blaadjes zijn dat?", "blaadjes"],
    ["🍡", n => "Er zijn " + n + " stokjes met elk 3 balletjes. Hoeveel balletjes zijn dat?", "balletjes"],
    ["👧", n => n + " kinderen hebben elk 3 ballonnen. Hoeveel ballonnen zijn dat samen?", "ballonnen"]
  ],
  5: [
    ["🖐️", n => "Je ziet " + n + " handjes. Elk handje heeft 5 vingers. Hoeveel vingers zijn dat?", "vingers"],
    ["📄", n => "Kitty plakt " + n + " rijtjes van 5 stickers. Hoeveel stickers zijn dat?", "stickers"],
    ["🪙", n => "Je hebt " + n + " munten van 5 cent. Hoeveel cent is dat?", "cent"]
  ],
  10: [
    ["💶", n => "Je hebt " + n + " briefjes van 10 euro. Hoeveel euro is dat?", "euro"],
    ["📦", n => "Er staan " + n + " dozen met elk 10 eieren. Hoeveel eieren zijn dat?", "eieren"],
    ["🧒", n => n + " kinderen steken allebei hun handen op. Elk kind heeft 10 vingers. Hoeveel vingers zie je?", "vingers"]
  ]
};

const plusReeks = (n, k) => n <= 6 ? reeks(n, () => k).join(" + ") : n + " keer " + k;
function tafelTip(k) {
  if (k === 10) return " Tip: bij de tafel van 10 zet je er een 0 achter.";
  if (k === 5) return " Tip: de tafel van 5 is de helft van de tafel van 10.";
  if (k === 2) return " Tip: 2 keer iets is het dubbele.";
  return " Tip: tel in sprongen van 3: 3, 6, 9, 12, 15 ...";
}
function tafelUitleg(n, k) {
  return n + " × " + k + " betekent " + n + " groepjes van " + k + ": " + plusReeks(n, k) + " = " + n * k + "." + tafelTip(k);
}
/* hulp: groepjes als het er niet te veel zijn, anders de sprongen van de tafel */
function tafelHulp(n, k, plaatje) {
  return () => {
    const d = el("div", { class: "hulpvak" });
    if (n * k <= 30 && n <= 6) {
      d.appendChild(el("div", { class: "label", tekst: n + " groepjes van " + k + ". Tel ze maar!" }));
      d.appendChild(groepjes(n, k, plaatje || "🔵"));
    } else {
      d.appendChild(el("div", { class: "label", tekst: "Tel in sprongen van " + k + ":" }));
      const rij = el("div", { class: "rij", stijl: "gap:6px" });
      for (let i = 1; i <= n; i++) {
        rij.appendChild(el("div", {
          class: "hokje", tekst: i < n ? String(i * k) : "?",
          stijl: "min-width:0;padding:0 10px;height:auto;font-size:20px;" + (i === n ? "background:#ffe0ec" : "")
        }));
      }
      d.appendChild(rij);
    }
    return d;
  };
}

/* Ballonnen: tik alle getallen uit de tafel van k aan. */
function ballonVraag(k, niv) {
  const veelvouden = reeks(10, i => (i + 1) * k);
  const goed = schud(veelvouden).slice(0, niv >= 3 ? 4 : 3);
  const nep = [];
  const kandidaat = () => {
    if (k === 10) return kies([5, 15, 25, 35, 45, 55, 11, 21, 19, 31, 49, 12]);
    const basis = kies(veelvouden);
    return basis + kies([-2, -1, 1, 2]);
  };
  for (let t = 0; nep.length < 4 && t < 200; t++) {
    const x = kandidaat();
    if (x > 0 && x % k !== 0 && !nep.includes(x)) nep.push(x);
  }
  const getallen = schud(goed.concat(nep));
  const kleur = schud(BALLONKLEUREN);
  const gekozen = new Set();
  let knoppen = [];
  const werkbij = () => knoppen.forEach((b, i) => b.classList.toggle("gekozen", gekozen.has(i)));
  return {
    opdracht: "Tik alle ballonnen aan met een getal uit <b>de tafel van " + k + "</b>.",
    uitleg: "De tafel van " + k + ": " + veelvouden.join(", ") + ". Hier waren dat: " +
      goed.slice().sort((a, b) => a - b).join(", ") + "." + tafelTip(k),
    antwoordTekst() {
      const t = [...gekozen].map(i => getallen[i]).sort((a, b) => a - b);
      return t.length ? "getikt: " + t.join(", ") : "niets getikt";
    },
    bouw(vlak) {
      const rij = el("div", { class: "rij", stijl: "gap:clamp(10px,1.8vw,22px);align-items:flex-start" });
      knoppen = getallen.map((g, i) => {
        const b = el("button", { class: "ballon", type: "button", tekst: String(g), stijl: "background:" + kleur[i % kleur.length] });
        b.addEventListener("click", () => {
          if (gekozen.has(i)) gekozen.delete(i); else gekozen.add(i);
          Geluid.klik(); werkbij();
        });
        rij.appendChild(b);
        return b;
      });
      vlak.appendChild(rij);
      vlak.appendChild(el("div", { class: "label", tekst: "Tik nog een keer op een ballon om hem weer los te laten. Klaar? Tik op Klaar!" }));
    },
    check() {
      return gekozen.size === goed.length && [...gekozen].every(i => goed.includes(getallen[i]));
    },
    /* na een eerste fout: de verkeerde ballonnen weer loslaten */
    herstel() {
      [...gekozen].forEach(i => { if (!goed.includes(getallen[i])) gekozen.delete(i); });
      werkbij();
    },
    toon() {
      knoppen.forEach((b, i) => {
        const hoort = goed.includes(getallen[i]);
        if (gekozen.has(i) && !hoort) b.classList.add("foutgekozen");
        if (hoort) b.classList.add("goedgekozen");
      });
      gekozen.clear();
      getallen.forEach((g, i) => { if (goed.includes(g)) gekozen.add(i); });
      werkbij();
    }
  };
}

/* Eén tafelvraag. tafels: lijst waaruit de tafel gekozen wordt. */
function tafelVraag(tafels, niv, soorten) {
  const k = kies(tafels);
  let n;
  if (niv === 1) n = kies([1, 2, 2, 3, 3, 4, 4, 5, 5, 10]);
  else if (niv === 2) n = rnd(1, 10);
  else n = kies([3, 4, 6, 6, 7, 7, 8, 8, 9, 9]);
  const p = n * k;
  const plaatje = kies(PLAATJES);
  let soort = kies(soorten);
  if (soort === "groepjes" && (n > 6 || n * k > 50)) soort = "som";

  if (soort === "groepjes") {
    const vraag = invulVraag("Hoeveel zijn het er samen?", vlak => {
      vlak.appendChild(groepjes(n, k, plaatje));
      vlak.appendChild(el("div", { class: "label", tekst: n + " groepjes van " + k }));
      vlak.appendChild(somRij([n, "×", k, "=", "?"]));
      vlak.appendChild(cijferpad());
    }, [p], tafelUitleg(n, k));
    return vraag;
  }

  if (soort === "rij") {
    const start = niv === 1 ? 1 : rnd(1, 5);
    const getallen = reeks(6, i => (start + i) * k);
    const gaten = schud([2, 3, 4, 5]).slice(0, niv === 1 ? 2 : 3).sort((a, b) => a - b);
    return reeksVraag(getallen, gaten, "Maak de rij van <b>de tafel van " + k + "</b> af.",
      "Bij de tafel van " + k + " komt er steeds " + k + " bij: " + getallen.join(", ") + ".");
  }

  if (soort === "keuze") {
    const fout = [p + k, p - k, n + k, p + 1, p - 1, p + 10, (n + 2) * k]
      .filter((x, i, a) => x > 0 && x !== p && a.indexOf(x) === i);
    const opties = schud([p].concat(schud(fout).slice(0, niv === 1 ? 2 : 3)));
    const vraag = keuzeVraag({
      opdracht: "Hoeveel is <b>" + n + " × " + k + "</b>?",
      uitleg: tafelUitleg(n, k),
      opties, goed: opties.indexOf(p),
      inhoud(knop, x) { knop.textContent = x; }
    });
    vraag.hulp = tafelHulp(n, k, plaatje);
    return vraag;
  }

  if (soort === "ballonnen") return ballonVraag(k, niv);

  if (soort === "verhaal") {
    const [ding, tekst, eenheid] = kies(TAFELVERHALEN[k]);
    const vraag = invulVraag(tekst(n), vlak => {
      if (niv < 3) vlak.appendChild(el("div", {
        stijl: "font-size:clamp(30px,6vh,46px);letter-spacing:6px;text-align:center;max-width:640px",
        tekst: reeks(n, () => ding).join("")
      }));
      vlak.appendChild(somRij([n, "×", k, "=", "?"]));
      vlak.appendChild(el("div", { class: "label", tekst: eenheid }));
      vlak.appendChild(cijferpad());
    }, [p], tafelUitleg(n, k));
    vraag.hulp = tafelHulp(n, k);
    return vraag;
  }

  if (soort === "buur") {
    /* afleiden: van een bekende som naar zijn buurman */
    /* vaak vanuit een ankersom (10 × of 5 ×), anders vanuit een buurman */
    const bekend = kies([10, 5, Math.min(9, Math.max(2, n))]);
    const vraagN = bekend === 10 ? 9 : bekend === 5 ? kies([4, 6]) : kies([bekend - 1, bekend + 1]);
    const omhoog = vraagN > bekend;
    return invulVraag("Je weet: <b>" + bekend + " × " + k + " = " + bekend * k + "</b>. Hoeveel is dan <b>" + vraagN + " × " + k + "</b>?", vlak => {
      vlak.appendChild(somRij([bekend, "×", k, "=", bekend * k]));
      vlak.appendChild(somRij([vraagN, "×", k, "=", "?"]));
      vlak.appendChild(cijferpad());
    }, [vraagN * k], (omhoog ? "Eén groepje van " + k + " erbij: " + bekend * k + " + " + k
      : "Eén groepje van " + k + " eraf: " + bekend * k + " − " + k) + " = " + vraagN * k + ".");
  }

  if (soort === "gat") {
    const vraag = invulVraag("Welk getal hoort in het lege vakje?", vlak => {
      vlak.appendChild(somRij(["?", "×", k, "=", p]));
      vlak.appendChild(cijferpad());
    }, [n], "Hoeveel groepjes van " + k + " zijn samen " + p + "? " + tafelUitleg(n, k));
    vraag.hulp = tafelHulp(n, k, plaatje);
    return vraag;
  }

  /* gewone keersom */
  const vraag = invulVraag("Reken uit.", vlak => {
    vlak.appendChild(somRij([n, "×", k, "=", "?"]));
    vlak.appendChild(cijferpad());
  }, [p], tafelUitleg(n, k));
  vraag.hulp = tafelHulp(n, k, plaatje);
  return vraag;
}

SPELLEN.tafels = {
  titel: "Tafels van 2, 5 en 10", emoji: "✖️", blok: 3,
  doel: "Ik oefen de tafels van 2, 5 en 10",
  maak(niv) {
    if (niv === 1) return tafelVraag([2, 10, 10, 2, 5], 1, ["groepjes", "groepjes", "keuze", "rij"]);
    if (niv === 2) return tafelVraag([2, 5, 10], 2, ["som", "som", "groepjes", "keuze", "gat", "ballonnen", "verhaal"]);
    return tafelVraag([2, 5, 10, 5], 3, ["som", "som", "gat", "ballonnen", "verhaal", "buur"]);
  }
};

SPELLEN.tafel3 = {
  titel: "De tafel van 3", emoji: "🍀", blok: 3,
  doel: "Ik oefen de tafel van 3",
  maak(niv) {
    if (niv === 1) return tafelVraag([3], 1, ["groepjes", "groepjes", "rij", "keuze"]);
    if (niv === 2) return tafelVraag([3], 2, ["som", "groepjes", "rij", "keuze", "verhaal", "ballonnen"]);
    return tafelVraag([3], 3, ["som", "som", "gat", "ballonnen", "verhaal", "buur"]);
  }
};

/* =========================================================================
   3. Optellen en aftrekken tot en met 100
   ========================================================================= */
function plus100Getallen(niv) {
  const soort = niv === 1 ? kies(["TT", "TE_E", "TE_T", "TE_T"])
    : niv === 2 ? kies(["TE_TE", "TE_TE", "TE_T", "TE_E_over"])
    : kies(["TE_TE_over", "TE_TE_over", "TE_TE"]);
  const plus = Math.random() < .5;
  const TE = () => rnd(1, 9) * 10 + rnd(1, 9);
  for (let t = 0; t < 400; t++) {
    let a, b;
    if (soort === "TT") { a = rnd(1, 9) * 10; b = rnd(1, 9) * 10; }
    else if (soort === "TE_E" || soort === "TE_E_over") { a = TE(); b = rnd(2, 9); }
    else if (soort === "TE_T") { a = TE(); b = rnd(1, 8) * 10; }
    else { a = TE(); b = rnd(1, 8) * 10 + rnd(1, 9); }
    const over = plus ? a % 10 + b % 10 >= 10 : a % 10 < b % 10;
    const moetOver = soort.endsWith("_over");
    if (over !== moetOver) continue;
    if (plus && a + b > 100) continue;
    if (!plus && a - b < 1) continue;
    return { a, b, plus, soort };
  }
  return { a: 40, b: 30, plus: true, soort: "TT" };
}
const VERHALEN100 = [
  [true, (a, b) => "In de bus zitten <b>" + a + "</b> kinderen. Er stappen er <b>" + b + "</b> in. Hoeveel kinderen zitten er nu in de bus?", "kinderen", "🚌"],
  [false, (a, b) => "In de bus zitten <b>" + a + "</b> kinderen. Er stappen er <b>" + b + "</b> uit. Hoeveel kinderen zitten er nog in de bus?", "kinderen", "🚌"],
  [true, (a, b) => "Kitty heeft <b>" + a + "</b> kralen. Ze krijgt er <b>" + b + "</b> bij. Hoeveel kralen heeft ze nu?", "kralen", "📿"],
  [false, (a, b) => "Er liggen <b>" + a + "</b> appels in de kist. Er worden er <b>" + b + "</b> opgegeten. Hoeveel appels liggen er nog?", "appels", "🍎"],
  [true, (a, b) => "Op het plein staan <b>" + a + "</b> fietsen. Er komen er <b>" + b + "</b> bij. Hoeveel fietsen staan er nu?", "fietsen", "🚲"],
  [false, (a, b) => "Een boek heeft <b>" + a + "</b> bladzijden. Je hebt er al <b>" + b + "</b> gelezen. Hoeveel bladzijden moet je nog?", "bladzijden", "📖"]
];

SPELLEN.plus100 = {
  titel: "Plus en min tot 100", emoji: "💯", blok: 3,
  doel: "Ik oefen optellen en aftrekken tot en met 100",
  maak(niv) {
    let { a, b, plus, soort } = plus100Getallen(niv);
    const teken = plus ? "+" : "−";
    const uit = plus ? a + b : a - b;
    const bT = b - b % 10, bE = b % 10;
    const stapNodig = bT > 0 && bE > 0;
    const tussen = plus ? a + bT : a - bT;
    const stappen = stapNodig
      ? "Eerst de tientallen: " + a + " " + teken + " " + bT + " = " + tussen + ". Dan de eenheden: " + tussen + " " + teken + " " + bE + " = " + uit + "."
      : bE === 0 && b >= 10 && a % 10 === 0
        ? "Reken met tientallen: " + a / 10 + " " + teken + " " + b / 10 + " = " + uit / 10 + ", dus " + a + " " + teken + " " + b + " = " + uit + "."
        : bE === 0
          ? "De eenheden blijven hetzelfde, alleen de tientallen veranderen: " + a + " " + teken + " " + b + " = " + uit + "."
          : soort === "TE_E"
            ? "Kijk naar de eenheden: " + a % 10 + " " + teken + " " + b + " = " + (plus ? a % 10 + b : a % 10 - b) +
              ". Dus " + a + " " + teken + " " + b + " = " + uit + "."
            : (() => {
                const tien = plus ? a - a % 10 + 10 : a - a % 10;
                const eerst = plus ? tien - a : a % 10;
                return "Eerst naar " + tien + ": " + a + " " + teken + " " + eerst + " = " + tien + ". Dan de rest: " +
                  tien + " " + teken + " " + (b - eerst) + " = " + uit + ".";
              })();
    const keuzes = niv === 1 ? ["som", "som", "verhaal"]
      : niv === 2 ? ["som", "stappen", "gat", "verhaal"]
      : ["som", "stappen", "gat", "verhaal"];
    let vorm = kies(keuzes);
    if (vorm === "stappen" && !stapNodig) vorm = "som";

    let vraag;
    if (vorm === "stappen") {
      vraag = invulVraag("Reken uit in twee stappen: <b>" + a + " " + teken + " " + b + "</b>", vlak => {
        vlak.appendChild(el("div", { class: "label", tekst: "Eerst de tientallen, dan de eenheden." }));
        vlak.appendChild(somRij([a, teken, bT, "=", "?"]));
        vlak.appendChild(somRij(["dan", teken, bE, "=", "?"]));
        vlak.appendChild(cijferpad());
      }, [tussen, uit], stappen);
    } else if (vorm === "gat") {
      vraag = invulVraag("Welk getal hoort in het lege vakje?", vlak => {
        vlak.appendChild(somRij([a, teken, "?", "=", uit]));
        vlak.appendChild(cijferpad());
      }, [b], a + " " + teken + " " + b + " = " + uit + ". " + (plus
        ? "Van " + a + " naar " + uit + " is " + b + "."
        : "Van " + uit + " naar " + a + " is ook " + b + "."));
    } else if (vorm === "verhaal") {
      const v = kies(VERHALEN100.filter(x => x[0] === plus));
      vraag = invulVraag(v[1](a, b), vlak => {
        vlak.appendChild(el("div", { stijl: "font-size:clamp(34px,7vh,54px)", tekst: v[3] }));
        vlak.appendChild(somRij([a, teken, b, "=", "?"]));
        vlak.appendChild(el("div", { class: "label", tekst: v[2] }));
        vlak.appendChild(cijferpad());
      }, [uit], stappen);
    } else {
      vraag = invulVraag("Reken uit.", vlak => {
        vlak.appendChild(somRij([a, teken, b, "=", "?"]));
        vlak.appendChild(cijferpad());
      }, [uit], stappen);
    }
    if (vorm !== "stappen") vraag.hulp = () => {
      const d = el("div", { class: "hulpvak" });
      d.appendChild(el("div", { class: "label", tekst: "Dit is " + a + ": " + Math.floor(a / 10) + " tientallen en " + a % 10 + " eenheden." }));
      d.appendChild(mabPlaatje(Math.floor(a / 10), a % 10));
      d.appendChild(el("div", {
        class: "label", stijl: "font-size:17px;margin-top:6px",
        tekst: stapNodig ? "Doe eerst " + teken + " " + bT + ", daarna " + teken + " " + bE + "."
          : bE === 0 ? teken + " " + b + " is " + teken + " " + b / 10 + " tientallen."
          : plus ? "Doe er " + b + " losse blokjes bij." : "Haal er " + b + " losse blokjes af."
      }));
      return d;
    };
    return vraag;
  }
};

/* =========================================================================
   4. Halveren en verdubbelen
   ========================================================================= */
function machine(tekst) {
  return el("div", { class: "machine", html: tekst });
}
function dubbelPlaatje(n, plaatje, spiegel) {
  const rij = el("div", { class: "rij", stijl: "gap:10px;align-items:stretch" });
  const kant = (vaag) => el("div", {
    stijl: "display:flex;flex-wrap:wrap;gap:2px;max-width:200px;justify-content:center;align-content:center;" +
      "font-size:30px;line-height:1.1;padding:8px;border:3px solid #cddcea;border-radius:16px;background:#fbfdff;" +
      (vaag ? "opacity:.35;border-style:dashed" : ""),
    tekst: reeks(n, () => plaatje).join("")
  });
  rij.appendChild(kant(false));
  if (spiegel) {
    rij.appendChild(el("div", { class: "spiegellijn" }));
    rij.appendChild(kant(true));
  }
  return rij;
}
const DUBBELVERHALEN = [
  (x, d) => "Kitty heeft <b>" + x + "</b> visjes. Haar zus heeft er <b>dubbel zoveel</b>. Hoeveel visjes heeft haar zus?",
  (x, d) => "Op de taart staan <b>" + x + "</b> kaarsjes. Op de grote taart staan er <b>twee keer zoveel</b>. Hoeveel kaarsjes zijn dat?",
  (x, d) => "Een rups eet op maandag <b>" + x + "</b> blaadjes. Op dinsdag eet hij er <b>het dubbele</b>. Hoeveel blaadjes op dinsdag?"
];
const HELFTVERHALEN = [
  (x) => "Er zitten <b>" + x + "</b> snoepjes in de zak. Jij krijgt <b>de helft</b>. Hoeveel snoepjes krijg je?",
  (x) => "Er liggen <b>" + x + "</b> knikkers. Twee kinderen verdelen ze eerlijk. Hoeveel knikkers krijgt ieder kind?",
  (x) => "Een pizza heeft <b>" + x + "</b> stukjes salami. Op de helft van de pizza liggen er evenveel als op de andere helft. Hoeveel liggen er op <b>de helft</b>?"
];

function dubbelUitleg(x) {
  const d = 2 * x;
  if (x >= 10 && x % 10 !== 0) {
    const t = x - x % 10, e = x % 10;
    return "Verdubbelen is er evenveel bij doen: " + x + " + " + x + ". Slim: het dubbele van " + t + " is " + 2 * t +
      ", het dubbele van " + e + " is " + 2 * e + ". Samen " + d + ".";
  }
  return "Verdubbelen is er evenveel bij doen: " + x + " + " + x + " = " + d + ".";
}
function helftUitleg(x) {
  const h = x / 2;
  if (x >= 20 && x % 20 !== 0 && x % 10 === 0)
    return "De helft van " + x + ": " + x + " = " + (x - 10) + " + 10. De helft van " + (x - 10) + " is " + (x - 10) / 2 +
      ", de helft van 10 is 5. Samen " + h + ". Controle: " + h + " + " + h + " = " + x + ".";
  if (x >= 20 && x % 10 !== 0 && (x - x % 10) % 20 === 0)
    return "De helft van " + (x - x % 10) + " is " + (x - x % 10) / 2 + ", de helft van " + x % 10 + " is " + (x % 10) / 2 +
      ". Samen " + h + ". Controle: " + h + " + " + h + " = " + x + ".";
  return "Halveren is eerlijk in twee gelijke delen verdelen: " + h + " + " + h + " = " + x + ". De helft van " + x + " is " + h + ".";
}

SPELLEN.dubbel = {
  titel: "Verdubbelen en halveren", emoji: "🪄", blok: 3,
  doel: "Ik oefen halveren en verdubbelen",
  maak(niv) {
    const dubbel = Math.random() < .5;
    const plaatje = kies(["🍓", "🐞", "🧁", "🌸", "🍪", "🐟", "⭐", "🍒"]);
    /* x is het getal dat verdubbeld wordt; bij halveren is 2x het begingetal */
    let x;
    if (niv === 1) x = rnd(1, 6);
    else if (niv === 2) x = kies([rnd(4, 10), rnd(6, 10), kies([10, 20, 30, 40, 50]), kies([10, 20, 40])]);
    else x = kies([kies([15, 25, 35, 45]), rnd(11, 24), rnd(11, 44), kies([12, 13, 14, 21, 22, 23, 31, 32, 33, 41, 42, 43])]);
    if (x > 50) x = 50;
    const d = 2 * x;
    const soort = niv === 1 ? kies(["plaatje", "plaatje", "machine"])
      : niv === 2 ? kies(["machine", "verhaal", "plaatje", "som"])
      : kies(["machine", "verhaal", "ketting", "terug", "som"]);

    if (soort === "plaatje") {
      if (dubbel)
        return invulVraag("<b>Verdubbelen!</b> Er komen er nog <b>evenveel</b> bij. Hoeveel zijn het er dan samen?", vlak => {
          vlak.appendChild(dubbelPlaatje(x, plaatje, true));
          const rij = el("div", { class: "rij" });
          rij.appendChild(woord("Het dubbele van " + x + " is"));
          rij.appendChild(invoerVak());
          vlak.appendChild(rij);
          vlak.appendChild(cijferpad());
        }, [d], dubbelUitleg(x));
      return invulVraag("<b>Halveren!</b> Er zijn <b>" + d + "</b> " + plaatje + ". Jij krijgt de helft. Hoeveel krijg je?", vlak => {
        vlak.appendChild(dingenRij(d, plaatje));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord("De helft van " + d + " is"));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [x], helftUitleg(d));
    }

    if (soort === "machine") {
      const inGetal = dubbel ? x : d, uitGetal = dubbel ? d : x;
      return invulVraag("Wat komt er uit de <b>" + (dubbel ? "verdubbelmachine" : "halveermachine") + "</b>?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:14px" });
        rij.appendChild(el("div", { class: "hokje", tekst: String(inGetal) }));
        rij.appendChild(woord("→", 30));
        rij.appendChild(machine(dubbel ? "🪄 dubbel" : "✂️ de helft"));
        rij.appendChild(woord("→", 30));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [uitGetal], dubbel ? dubbelUitleg(x) : helftUitleg(d));
    }

    if (soort === "ketting") {
      /* twee keer achter elkaar door de machine */
      let start = dubbel ? kies([2, 3, 4, 5, 6, 10, 12, 15, 20, 25]) : kies([20, 40, 60, 80, 100, 12, 24, 16, 32, 48]);
      const een = dubbel ? 2 * start : start / 2;
      const twee = dubbel ? 2 * een : een / 2;
      return invulVraag("Het getal gaat <b>twee keer</b> door de " + (dubbel ? "verdubbelmachine" : "halveermachine") + ". Wat komt eruit?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:10px" });
        rij.appendChild(el("div", { class: "hokje", tekst: String(start) }));
        rij.appendChild(machine(dubbel ? "🪄 dubbel" : "✂️ helft"));
        rij.appendChild(invoerVak());
        rij.appendChild(machine(dubbel ? "🪄 dubbel" : "✂️ helft"));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [een, twee], dubbel ? "Het dubbele van " + start + " is " + een + ". Het dubbele van " + een + " is " + twee + "."
        : "De helft van " + start + " is " + een + ". De helft van " + een + " is " + twee + ".");
    }

    if (soort === "terug") {
      return invulVraag("Kitty verdubbelt een getal en krijgt <b>" + d + "</b>. Met welk getal begon ze?", vlak => {
        const rij = el("div", { class: "rij", stijl: "gap:14px" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord("→", 30));
        rij.appendChild(machine("🪄 dubbel"));
        rij.appendChild(woord("→", 30));
        rij.appendChild(el("div", { class: "hokje", tekst: String(d) }));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [x], "Terugrekenen van verdubbelen is halveren. " + helftUitleg(d));
    }

    if (soort === "verhaal") {
      const tekst = dubbel ? kies(DUBBELVERHALEN)(x) : kies(HELFTVERHALEN)(d);
      return invulVraag(tekst, vlak => {
        if (niv < 3 && (dubbel ? x : d) <= 20) vlak.appendChild(dingenRij(dubbel ? x : d, plaatje));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord(dubbel ? "Het dubbele van " + x + " is" : "De helft van " + d + " is"));
        rij.appendChild(invoerVak());
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [dubbel ? d : x], dubbel ? dubbelUitleg(x) : helftUitleg(d));
    }

    /* som: x + x = ? of ? + ? = d */
    if (dubbel)
      return invulVraag("Wat is <b>het dubbele van " + x + "</b>?", vlak => {
        vlak.appendChild(somRij([x, "+", x, "=", "?"]));
        vlak.appendChild(cijferpad());
      }, [d], dubbelUitleg(x));
    return invulVraag("Wat is <b>de helft van " + d + "</b>? Twee gelijke getallen die samen " + d + " zijn.", vlak => {
      vlak.appendChild(somRij(["?", "+", "?", "=", d]));
      vlak.appendChild(cijferpad());
    }, [x, x], helftUitleg(d));
  }
};

/* =========================================================================
   5. Klokkijken met kwartieren
   ========================================================================= */
/* tijd in kwartieren sinds 12 uur (0..47) */
const kwVan = t => { t = ((t % 48) + 48) % 48; return { u: Math.floor(t / 4) || 12, m: (t % 4) * 15 }; };
const kwTel = (u, m) => (u % 12) * 4 + m / 15;
function kwNaam(u, m) {
  const volgend = u % 12 + 1;
  if (m === 0) return u + " uur";
  if (m === 15) return "kwart over " + u;
  if (m === 30) return "half " + volgend;
  return "kwart voor " + volgend;
}
/* dezelfde tijd met kwart over en kwart voor omgedraaid: de klassieke vergissing */
function kwSpiegel(u, m) {
  if (m === 15) return kwVan(kwTel(u, 45) - 4);      /* kwart over 3 -> kwart voor 3 */
  if (m === 45) return kwVan(kwTel(u, 15) + 4);      /* kwart voor 4 (3:45) -> kwart over 4 */
  return { u: u, m: kies([15, 45]) };
}
function kwUitleg(u, m) {
  const volgend = u % 12 + 1;
  if (m === 0) return "De lange wijzer staat op de 12 en de korte wijzer op de " + u + ". Het is " + u + " uur.";
  if (m === 15) return "De lange wijzer staat op de 3: een kwartier na het hele uur. De korte wijzer is net voorbij de " + u +
    ". Het is kwart over " + u + ".";
  if (m === 30) return "De lange wijzer staat op de 6: het is half. De korte wijzer staat tussen de " + u + " en de " + volgend +
    ". Het is half " + volgend + ".";
  return "De lange wijzer staat op de 9: nog een kwartier, dan is het heel. De korte wijzer is al bijna bij de " + volgend +
    ". Het is kwart voor " + volgend + ".";
}

SPELLEN.kwartier = {
  titel: "Klokkijken met kwartieren", emoji: "🕘", blok: 3,
  doel: "Ik oefen klokkijken met kwartieren",
  maak(niv) {
    const u = rnd(1, 12);
    const m = niv === 1 ? kies([15, 15, 45, 45, 0, 30]) : kies([15, 45, 15, 45, 30, 0]);
    const naam = kwNaam(u, m);
    const soort = niv === 1 ? kies(["wijzer", "lezen", "lezen", "kiesklok"])
      : niv === 2 ? kies(["lezen", "kiesklok", "zetten", "lezen"])
      : kies(["lezen", "kiesklok", "zetten", "later", "later", "hoelang"]);

    if (soort === "wijzer") {
      const kwart = kies([15, 45]);
      const nm = kwNaam(u, kwart);
      const goed = kwart === 15 ? "op de 3" : "op de 9";
      const opties = ["op de 12", "op de 3", "op de 6", "op de 9"];
      return keuzeVraag({
        opdracht: "Het is <b>" + nm + "</b>. Waar staat de <b>lange wijzer</b>?",
        uitleg: kwart === 15 ? "Bij kwart over staat de lange wijzer op de 3: een kwart van de klok rond."
          : "Bij kwart voor staat de lange wijzer op de 9: nog een kwart, dan is hij weer bij de 12.",
        opties, goed: opties.indexOf(goed),
        boven(vlak) { vlak.appendChild(klokPlaatje(12, 0, 120)); vlak.appendChild(el("div", { class: "label", tekst: "Op deze klok is het 12 uur." })); },
        inhoud(knop, t) { knop.textContent = t; }
      });
    }

    if (soort === "lezen") {
      const sp = kwSpiegel(u, m);
      const t = kwTel(u, m);
      const pool = [kwNaam(sp.u, sp.m)].concat(schud([4, -4, 1, -1, 2, -2].map(x => { const v = kwVan(t + x); return kwNaam(v.u, v.m); })))
        .filter((x, i, a) => x !== naam && a.indexOf(x) === i);
      const opties = schud([naam].concat(pool.slice(0, niv === 1 ? 2 : 3)));
      return keuzeVraag({
        opdracht: "Hoe laat is het?",
        uitleg: kwUitleg(u, m),
        opties, goed: opties.indexOf(naam),
        boven(vlak) { vlak.appendChild(klokPlaatje(u, m, 190)); },
        inhoud(knop, x) { knop.textContent = x; }
      });
    }

    if (soort === "kiesklok") {
      const goed = { u, m };
      const t = kwTel(u, m);
      const sp = kwSpiegel(u, m);
      const kandidaten = [sp, kwVan(t + 4), kwVan(t - 4), kwVan(t + 2)]
        .filter((c, i, a) => kwTel(c.u, c.m) !== t && a.findIndex(x => kwTel(x.u, x.m) === kwTel(c.u, c.m)) === i);
      const opties = schud([goed].concat(kandidaten.slice(0, niv === 1 ? 2 : 3)));
      return keuzeVraag({
        opdracht: "Welke klok wijst <b>" + naam + "</b> aan?",
        uitleg: kwUitleg(u, m),
        opties, goed: opties.indexOf(goed), plaatje: true,
        inhoud(knop, c) {
          knop.appendChild(klokPlaatje(c.u, c.m, 150));
          knop.setAttribute("data-naam", "klok op " + kwNaam(c.u, c.m));
        }
      });
    }

    if (soort === "later") {
      const stap = kies([[1, "een kwartier later"], [-1, "een kwartier eerder"], [2, "een half uur later"], [3, "drie kwartier later"], [4, "een uur later"]]);
      const dan = kwVan(kwTel(u, m) + stap[0]);
      const goedNaam = kwNaam(dan.u, dan.m);
      const sp = kwSpiegel(dan.u, dan.m);
      const pool = [kwNaam(sp.u, sp.m)].concat(schud([-2, -1, 1, 2, 3, 4, 5].filter(x => x !== stap[0])
        .map(x => { const v = kwVan(kwTel(u, m) + x); return kwNaam(v.u, v.m); })))
        .filter((x, i, a) => x !== goedNaam && a.indexOf(x) === i);
      const opties = schud([goedNaam].concat(pool.slice(0, 3)));
      return keuzeVraag({
        opdracht: "Het is <b>" + naam + "</b>. Hoe laat is het <b>" + stap[1] + "</b>?",
        uitleg: "Een kwartier is een kwart van de klok rond: de lange wijzer gaat dan 3 cijfers verder. " +
          "Van " + naam + " " + (stap[0] > 0 ? "vooruit" : "terug") + " met " + stap[1].replace(/ (later|eerder)/, "") + " is " + goedNaam + ".",
        opties, goed: opties.indexOf(goedNaam),
        boven(vlak) { vlak.appendChild(klokPlaatje(u, m, 160)); },
        inhoud(knop, x) { knop.textContent = x; }
      });
    }

    if (soort === "hoelang") {
      const duur = rnd(1, 4);
      const dan = kwVan(kwTel(u, m) + duur);
      const NAMEN = ["een kwartier", "een half uur", "drie kwartier", "een uur"];
      const ding = kies([["De film", "🎬"], ["Zwemles", "🏊"], ["Het feestje", "🎉"], ["De voorleesles", "📚"]]);
      const opties = NAMEN.slice();
      return keuzeVraag({
        opdracht: ding[0] + " begint om <b>" + naam + "</b> en is klaar om <b>" + kwNaam(dan.u, dan.m) + "</b>. Hoe lang duurt het?",
        uitleg: "Tel de kwartieren: de lange wijzer gaat " + duur + " keer een kwart rond. " + duur + " kwartier" +
          (duur === 2 ? " is een half uur." : duur === 4 ? " is een heel uur." : duur === 3 ? " is drie kwartier." : "."),
        opties, goed: duur - 1,
        boven(vlak) {
          const rij = el("div", { class: "rij", stijl: "gap:24px" });
          rij.appendChild(klokPlaatje(u, m, 140));
          rij.appendChild(woord(ding[1] + " →", 34));
          rij.appendChild(klokPlaatje(dan.u, dan.m, 140));
          vlak.appendChild(rij);
        },
        inhoud(knop, x) { knop.textContent = x; }
      });
    }

    /* zelf de klok zetten met knoppen */
    const doel = kwTel(u, m);
    let nu = doel === 0 ? 24 : 0;
    let houder = null;
    const teken = () => {
      houder.innerHTML = "";
      const t = kwVan(nu);
      houder.appendChild(klokPlaatje(t.u, t.m, 200));
    };
    return {
      opdracht: "Zet de klok op <b>" + naam + "</b>.",
      uitleg: kwUitleg(u, m),
      antwoordTekst() { const t = kwVan(nu); return "klok op " + kwNaam(t.u, t.m); },
      bouw(vlak) {
        houder = el("div");
        const knop = (tekst, stap) => el("button", {
          class: "knop stil", type: "button", tekst,
          onclick: () => { nu = (nu + stap + 48) % 48; Geluid.klik(); teken(); }
        });
        const rij = el("div", { class: "rij", stijl: "gap:18px" });
        const links = el("div", { stijl: "display:flex;flex-direction:column;gap:10px" });
        const rechts = el("div", { stijl: "display:flex;flex-direction:column;gap:10px" });
        links.appendChild(knop("◀ 1 uur terug", -4));
        links.appendChild(knop("◀ kwartier terug", -1));
        rechts.appendChild(knop("1 uur verder ▶", 4));
        rechts.appendChild(knop("kwartier verder ▶", 1));
        rij.appendChild(links); rij.appendChild(houder); rij.appendChild(rechts);
        vlak.appendChild(rij);
        vlak.appendChild(el("div", { class: "label", tekst: "Kijk ook naar de korte wijzer: die schuift een beetje mee." }));
        teken();
      },
      check() { return nu === doel; },
      toon() { nu = doel; if (houder) teken(); }
    };
  }
};

/* =========================================================================
   6. Kilogram en gram
   ========================================================================= */
/* een ding of gewichtje op de weegschaal: {e:"🍎"} of {g:500} of {kg:2} */
function weegding(x, yB, it) {
  if (it.e) return { s: '<text x="' + x + '" y="' + (yB - 4) + '" text-anchor="middle" font-size="42">' + it.e + "</text>", w: 50 };
  const tekst = it.kg ? it.kg + " kg" : it.g + " g";
  const groot = it.kg ? Math.min(46, 30 + it.kg * 3) : it.g >= 500 ? 40 : it.g >= 200 ? 33 : it.g >= 100 ? 28 : 24;
  const w = groot + 12, h = groot;
  const s = '<rect x="' + (x - 5) + '" y="' + (yB - h - 7) + '" width="10" height="9" rx="3" fill="#5f6b77"/>' +
    '<path d="M' + (x - w / 2 + 6) + ' ' + (yB - h) + ' L' + (x + w / 2 - 6) + ' ' + (yB - h) + ' L' + (x + w / 2) + ' ' + yB +
    ' L' + (x - w / 2) + ' ' + yB + ' Z" fill="#7b8794" stroke="#4a545e" stroke-width="2"/>' +
    '<text x="' + x + '" y="' + (yB - h / 2 + 5) + '" text-anchor="middle" font-size="' + (tekst.length > 4 ? 12 : 14) +
    '" font-weight="bold" font-family="Trebuchet MS" fill="#fff">' + tekst + "</text>";
  return { s, w };
}
/* kant: -1 links omlaag, 0 recht, 1 rechts omlaag */
function weegschaal(links, rechts, kant, maat) {
  const W = 480, H = 270, px = 240, py = 70, half = 165;
  const a = kant * 9 * Math.PI / 180;
  const eL = { x: px - half * Math.cos(a), y: py - half * Math.sin(a) };
  const eR = { x: px + half * Math.cos(a), y: py + half * Math.sin(a) };
  let s = '<rect x="' + (px - 70) + '" y="248" width="140" height="14" rx="7" fill="#c79bb0"/>' +
    '<path d="M' + (px - 12) + ' 250 L' + (px - 6) + ' ' + py + ' L' + (px + 6) + ' ' + py + ' L' + (px + 12) + ' 250 Z" fill="#d9b3c5" stroke="#a87590" stroke-width="2"/>' +
    '<line x1="' + eL.x + '" y1="' + eL.y + '" x2="' + eR.x + '" y2="' + eR.y + '" stroke="#a87590" stroke-width="9" stroke-linecap="round"/>' +
    '<circle cx="' + px + '" cy="' + py + '" r="10" fill="#ff4d87" stroke="#c22458" stroke-width="3"/>' +
    /* wijzertje in het midden: staat recht als het in evenwicht is */
    '<line x1="' + px + '" y1="' + py + '" x2="' + (px + 34 * Math.sin(a)) + '" y2="' + (py - 34 * Math.cos(a)) + '" stroke="#c22458" stroke-width="4" stroke-linecap="round"/>';
  const schaal = (e, inhoud) => {
    const yB = e.y + 78;
    let t = '<line x1="' + e.x + '" y1="' + e.y + '" x2="' + (e.x - 62) + '" y2="' + yB + '" stroke="#b9a3ae" stroke-width="2"/>' +
      '<line x1="' + e.x + '" y1="' + e.y + '" x2="' + (e.x + 62) + '" y2="' + yB + '" stroke="#b9a3ae" stroke-width="2"/>';
    const delen = inhoud.map(it => weegding(0, yB, it));
    const totaal = delen.reduce((x, d) => x + d.w, 0) + (delen.length - 1) * 4;
    let x = e.x - totaal / 2;
    inhoud.forEach((it, i) => {
      const d = weegding(x + delen[i].w / 2, yB, it);
      t += d.s;
      x += delen[i].w + 4;
    });
    t += '<path d="M' + (e.x - 78) + ' ' + yB + ' Q ' + e.x + ' ' + (yB + 30) + ' ' + (e.x + 78) + ' ' + yB + ' Z" fill="#ffd0e4" stroke="#c22458" stroke-width="3"/>';
    return t;
  };
  s += schaal(eL, links) + schaal(eR, rechts);
  const d = svg(s, W, H);
  if (maat) d.style.maxWidth = maat + "px";
  return d;
}
/* bedrag in gewichtjes, groot naar klein, met minstens twee stukken als dat kan */
function inGewichtjes(totaal, stukken) {
  const r = [];
  stukken.slice().sort((a, b) => b - a).forEach(s => { while (totaal >= s) { r.push(s); totaal -= s; } });
  if (r.length === 1) {
    const splits = { 500: [200, 200, 100], 200: [100, 100], 5: [2, 2, 1], 2: [1, 1] }[r[0]];
    if (splits) return splits;
  }
  return r;
}

/* gewicht in gram, ongeveer */
const WEEGDINGEN = [
  ["🪶", "veer", 1, "de"], ["🍬", "snoepje", 5, "het"], ["✏️", "potlood", 10, "het"], ["🍓", "aardbei", 15, "de"],
  ["🍌", "banaan", 150, "de"], ["🍎", "appel", 200, "de"],
  ["🍉", "watermeloen", 4000, "de"], ["🐈", "poes", 4000, "de"], ["🎃", "pompoen", 6000, "de"], ["🐕", "hond", 20000, "de"],
  ["🚲", "fiets", 15000, "de"], ["🧒", "kind", 25000, "het"]
];
const hetDing = d => d[3] + " " + d[1];
const HetDing = d => d[3].charAt(0).toUpperCase() + d[3].slice(1) + " " + d[1];

SPELLEN.gewicht = {
  titel: "Kilogram en gram", emoji: "⚖️", blok: 3,
  doel: "Ik leer over kilogram en gram",
  maak(niv) {
    const soort = niv === 1 ? kies(["zwaarder", "zwaarder", "eenheid", "lichter"])
      : niv === 2 ? kies(["gram", "kilo", "pakjes", "eenheid", "zwaarder"])
      : kies(["evenwicht", "evenwicht", "erbij", "vergelijk", "pakjes", "gram"]);

    if (soort === "zwaarder" || soort === "lichter") {
      let a, b;
      do { [a, b] = schud(WEEGDINGEN).slice(0, 2); } while (Math.max(a[2], b[2]) / Math.min(a[2], b[2]) < 4);
      const zwaar = a[2] > b[2] ? 0 : 1;
      const goed = soort === "zwaarder" ? zwaar : 1 - zwaar;
      const opties = [0, 1];
      const ding = [a, b];
      return keuzeVraag({
        opdracht: "Kijk naar de weegschaal. Wat is <b>" + soort + "</b>?",
        uitleg: "De kant die naar beneden zakt is het zwaarst. " + HetDing(ding[zwaar]) + " is zwaarder dan " + hetDing(ding[1 - zwaar]) + ".",
        opties, goed,
        boven(vlak) { vlak.appendChild(weegschaal([{ e: a[0] }], [{ e: b[0] }], zwaar === 0 ? -1 : 1, 380)); },
        inhoud(knop, i) { knop.innerHTML = '<span style="font-size:1.5em">' + ding[i][0] + "</span> " + hetDing(ding[i]); }
      });
    }

    if (soort === "eenheid") {
      const ding = kies(WEEGDINGEN.filter(d => d[2] < 300 || d[2] >= 4000));
      const goed = ding[2] < 1000 ? 0 : 1;
      const opties = [0, 1];
      return keuzeVraag({
        opdracht: "Hoe weeg je een " + ding[1] + " " + ding[0] + "? In <b>gram</b> of in <b>kilogram</b>?",
        uitleg: "Lichte dingen weeg je in gram. Zware dingen weeg je in kilogram. 1 kilogram is 1000 gram." +
          (goed ? " Een " + ding[1] + " is zwaar: kilogram." : " Een " + ding[1] + " is licht: gram."),
        opties, goed,
        boven(vlak) { vlak.appendChild(el("div", { stijl: "font-size:clamp(50px,11vh,90px);text-align:center", tekst: ding[0] })); },
        inhoud(knop, i) { knop.textContent = i ? "kilogram (kg)" : "gram (g)"; }
      });
    }

    if (soort === "kilo") {
      const ding = kies([["🐈", "de poes", 3, 7], ["🎃", "de pompoen", 3, 9], ["🍉", "de watermeloen", 3, 6], ["🎒", "de rugzak", 2, 6], ["🐶", "de puppy", 3, 9]]);
      const kg = rnd(ding[2], ding[3]);
      const stukken = inGewichtjes(kg, [5, 2, 1]);
      return invulVraag("De weegschaal is in evenwicht. Hoeveel kilo weegt <b>" + ding[1] + "</b>?", vlak => {
        vlak.appendChild(weegschaal([{ e: ding[0] }], stukken.map(x => ({ kg: x })), 0, 400));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord("kilogram"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [kg], "De weegschaal staat recht, dus beide kanten zijn even zwaar: " + stukken.join(" + ") + " = " + kg + " kilogram.");
    }

    if (soort === "gram") {
      const ding = kies([["🍎", "de appel"], ["🧀", "de kaas"], ["📚", "het boek"], ["🧸", "de beer"], ["🥥", "de kokosnoot"]]);
      const g = niv === 2 ? rnd(2, 9) * 100 : kies([rnd(2, 9) * 100, rnd(2, 9) * 100 + 50, 150, 250, 350]);
      const stukken = inGewichtjes(g, [500, 200, 100, 50]);
      return invulVraag("De weegschaal is in evenwicht. Hoeveel gram weegt <b>" + ding[1] + "</b>?", vlak => {
        vlak.appendChild(weegschaal([{ e: ding[0] }], stukken.map(x => ({ g: x })), 0, 400));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord("gram"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [g], "Tel de gewichtjes op: " + stukken.join(" + ") + " = " + g + " gram.");
    }

    if (soort === "pakjes") {
      const stuk = niv === 2 ? kies([500, 500, 100]) : kies([250, 200, 100, 500]);
      const ding = kies([["🧈", "pakjes boter"], ["🍫", "repen chocola"], ["🍝", "pakken spaghetti"]]);
      const aantal = 1000 / stuk;
      return invulVraag("Eén van deze " + ding[1].split(" ")[0] + " weegt <b>" + stuk + " gram</b>. Hoeveel " + ding[1] + " wegen samen <b>1 kilogram</b>?", vlak => {
        vlak.appendChild(el("div", { stijl: "font-size:44px", tekst: ding[0] + " = " + stuk + " g" }));
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord(ding[1] + " = 1 kilogram"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [aantal], "1 kilogram is 1000 gram. " + reeks(aantal, () => stuk).join(" + ") + " = 1000. Dat zijn " + aantal + " " + ding[1] + ".");
    }

    if (soort === "erbij") {
      const al = rnd(1, 9) * 100;
      return invulVraag("Op de weegschaal ligt <b>" + al + " gram</b> meel. Hoeveel gram moet erbij voor precies <b>1 kilogram</b>?", vlak => {
        vlak.appendChild(el("div", { stijl: "font-size:44px", tekst: "🥣" }));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord(al + " + "));
        rij.appendChild(invoerVak());
        rij.appendChild(woord(" = 1000 gram"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [1000 - al], "1 kilogram is 1000 gram. " + al + " + " + (1000 - al) + " = 1000. Net als " + al / 100 + " + " + (10 - al / 100) + " = 10.");
    }

    if (soort === "vergelijk") {
      const gram = kies([500, 800, 900, 1000, 1000]);
      const opties = ["1 kilogram veren", gram + " gram suiker", "even zwaar"];
      const goed = gram === 1000 ? 2 : 0;
      return keuzeVraag({
        opdracht: "Wat is <b>zwaarder</b>: 1 kilogram veren 🪶 of " + gram + " gram suiker 🍚?",
        uitleg: "1 kilogram is 1000 gram, of het nu veren zijn of suiker. " +
          (gram === 1000 ? "1000 gram is precies 1 kilogram: even zwaar!" : "1000 gram is meer dan " + gram + " gram, dus de veren zijn zwaarder."),
        opties: [0, 1, 2], goed,
        inhoud(knop, i) { knop.textContent = opties[i]; }
      });
    }

    /* evenwicht maken: tik gewichtjes aan tot de weegschaal recht staat */
    const ding = kies([["🧸", "De beer"], ["🎂", "De taart"], ["🍍", "De ananas"], ["🪀", "De jojo"], ["🥥", "De kokosnoot"]]);
    const doel = rnd(2, 9) * 100;
    const voorraad = [500, 200, 200, 100];
    const op = new Set();
    let tekenWeeg = null, knoppen = [];
    const som = () => [...op].reduce((x, i) => x + voorraad[i], 0);
    return {
      opdracht: ding[1] + " weegt <b>" + doel + " gram</b>. Tik gewichtjes aan tot de weegschaal <b>recht</b> staat.",
      uitleg: "Je hebt " + inGewichtjes(doel, [500, 200, 100]).join(" + ") + " = " + doel + " gram nodig.",
      antwoordTekst() { const s = [...op].map(i => voorraad[i]).sort((a, b) => b - a); return s.length ? s.join(" + ") + " = " + som() + " gram" : "geen gewichtjes"; },
      bouw(vlak) {
        const houder = el("div", { stijl: "width:100%;display:flex;justify-content:center" });
        tekenWeeg = () => {
          houder.innerHTML = "";
          const s = som();
          houder.appendChild(weegschaal([{ e: ding[0] }], [...op].sort((a, b) => a - b).map(i => ({ g: voorraad[i] })),
            s === doel ? 0 : s > doel ? 1 : -1, 400));
          knoppen.forEach((k, i) => k.classList.toggle("gekozen", op.has(i)));
        };
        vlak.appendChild(houder);
        const rij = el("div", { class: "rij", stijl: "gap:14px" });
        knoppen = voorraad.map((g, i) => {
          const k = el("button", { class: "keuze plaatje gewichtknop", type: "button" });
          const plaatje = svg(weegding(30, 50, { g }).s, 60, 54);
          plaatje.style.width = "60px";
          k.appendChild(plaatje);
          k.addEventListener("click", () => { if (op.has(i)) op.delete(i); else op.add(i); Geluid.klik(); tekenWeeg(); });
          rij.appendChild(k);
          return k;
        });
        vlak.appendChild(rij);
        vlak.appendChild(el("div", { class: "label", tekst: "Tik een gewichtje om het op de weegschaal te leggen, en nog een keer om het eraf te halen." }));
        tekenWeeg();
      },
      check() { return som() === doel; },
      toon() {
        op.clear();
        let rest = doel;
        voorraad.forEach((g, i) => { if (g <= rest) { op.add(i); rest -= g; } });
        if (tekenWeeg) tekenWeeg();
      }
    };
  }
};

/* =========================================================================
   7. Omtrek
   ========================================================================= */
const celSleutel = (r, c) => r + "," + c;
function rechthoekCellen(b, h) {
  const c = [];
  for (let r = 0; r < h; r++) for (let k = 0; k < b; k++) c.push([r, k]);
  return c;
}
function lCellen(b, h) {
  const cb = rnd(1, b - 1), ch = rnd(1, h - 1);
  return rechthoekCellen(b, h).filter(([r, k]) => !(r < ch && k >= b - cb));
}
function uCellen(b, h) {
  const k0 = rnd(1, b - 2), diep = rnd(1, h - 1);
  return rechthoekCellen(b, h).filter(([r, k]) => !(k === k0 && r < diep));
}
function omtrekVan(cellen) {
  const set = new Set(cellen.map(([r, c]) => celSleutel(r, c)));
  let n = 0;
  cellen.forEach(([r, c]) => [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => { if (!set.has(celSleutel(r + dr, c + dc))) n++; }));
  return n;
}
/* figuur op ruitjespapier. modus: "rand" (omtrek roze), "vlak" (binnenkant roze), "lijn" (lijn door het midden) */
function roosterFiguur(cellen, opt) {
  opt = opt || {};
  const m = opt.maat || 40;
  const R = Math.max.apply(null, cellen.map(c => c[0])) + 1;
  const C = Math.max.apply(null, cellen.map(c => c[1])) + 1;
  const W = (C + 2) * m, H = (R + 2) * m;
  const set = new Set(cellen.map(([r, c]) => celSleutel(r, c)));
  const modus = opt.modus || "rand";
  let s = "";
  for (let x = 0; x <= C + 2; x++) s += '<line x1="' + x * m + '" y1="0" x2="' + x * m + '" y2="' + H + '" stroke="#e3ecf4" stroke-width="1.5"/>';
  for (let y = 0; y <= R + 2; y++) s += '<line x1="0" y1="' + y * m + '" x2="' + W + '" y2="' + y * m + '" stroke="#e3ecf4" stroke-width="1.5"/>';
  cellen.forEach(([r, c]) => {
    s += '<rect x="' + (c + 1) * m + '" y="' + (r + 1) * m + '" width="' + m + '" height="' + m + '" fill="' +
      (modus === "vlak" ? "#ff85b3" : modus === "rand" ? "#fff0f6" : "#fff") + '" stroke="#f0d3e0" stroke-width="1"/>';
  });
  const randen = [];
  cellen.forEach(([r, c]) => {
    const x = (c + 1) * m, y = (r + 1) * m;
    if (!set.has(celSleutel(r - 1, c))) randen.push([x, y, x + m, y]);
    if (!set.has(celSleutel(r + 1, c))) randen.push([x, y + m, x + m, y + m]);
    if (!set.has(celSleutel(r, c - 1))) randen.push([x, y, x, y + m]);
    if (!set.has(celSleutel(r, c + 1))) randen.push([x + m, y, x + m, y + m]);
  });
  const randKleur = modus === "rand" ? "#ff4d87" : "#9aa7b4";
  const randDikte = modus === "rand" ? 6 : 2.5;
  randen.forEach(([x1, y1, x2, y2]) => {
    s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + randKleur + '" stroke-width="' + randDikte + '" stroke-linecap="round"/>';
  });
  if (modus === "lijn") {
    const y = (1 + R / 2) * m;
    s += '<line x1="' + m + '" y1="' + y + '" x2="' + (C + 1) * m + '" y2="' + y + '" stroke="#ff4d87" stroke-width="6" stroke-linecap="round"/>';
  }
  if (opt.stippen) randen.forEach(([x1, y1, x2, y2]) => {
    s += '<circle cx="' + (x1 + x2) / 2 + '" cy="' + (y1 + y2) / 2 + '" r="5" fill="#43263a"/>';
  });
  if (opt.beestje) {
    const eerste = cellen.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])[0];
    s += '<text x="' + (eerste[1] + 1) * m + '" y="' + ((eerste[0] + 1) * m + 9) + '" text-anchor="middle" font-size="26">🐞</text>';
  }
  const d = svg(s, W, H);
  d.style.maxWidth = Math.round(W * (opt.schaal || 1.15)) + "px";
  return d;
}
/* rechthoek met maten erbij */
function maatRechthoek(b, h, eenheid, alleKanten, vulling) {
  const k = Math.min(32, 220 / Math.max(b, h));
  const w = b * k, hh = h * k, x0 = 70, y0 = 40;
  const W = w + 140, H = hh + 80;
  const tekst = (x, y, t, anker) => '<text x="' + x + '" y="' + y + '" text-anchor="' + (anker || "middle") +
    '" font-size="17" font-weight="bold" font-family="Trebuchet MS" fill="#c22458">' + t + "</text>";
  let s = '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + hh + '" fill="#fff0f6" stroke="#ff4d87" stroke-width="5" stroke-linejoin="round"/>';
  if (vulling) s += '<text x="' + (x0 + w / 2) + '" y="' + (y0 + hh / 2 + 10) + '" text-anchor="middle" font-size="28">' + vulling + "</text>";
  s += tekst(x0 + w / 2, y0 - 12, b + " " + eenheid);
  s += tekst(x0 - 10, y0 + hh / 2 + 6, h + " " + eenheid, "end");
  if (alleKanten) {
    s += tekst(x0 + w / 2, y0 + hh + 26, b + " " + eenheid);
    s += tekst(x0 + w + 10, y0 + hh / 2 + 6, h + " " + eenheid, "start");
  }
  const d = svg(s, W, H);
  d.style.maxWidth = Math.round(W * 1.3) + "px";
  return d;
}
function maatDriehoek(z) {
  const s = '<polygon points="50,190 290,190 130,40" fill="#fff0f6" stroke="#ff4d87" stroke-width="5" stroke-linejoin="round"/>' +
    '<text x="170" y="218" text-anchor="middle" font-size="17" font-weight="bold" font-family="Trebuchet MS" fill="#c22458">' + z[0] + " cm</text>" +
    '<text x="225" y="110" text-anchor="start" font-size="17" font-weight="bold" font-family="Trebuchet MS" fill="#c22458">' + z[1] + " cm</text>" +
    '<text x="80" y="110" text-anchor="end" font-size="17" font-weight="bold" font-family="Trebuchet MS" fill="#c22458">' + z[2] + " cm</text>";
  const d = svg(s, 340, 230);
  d.style.maxWidth = "380px";
  return d;
}

SPELLEN.omtrek = {
  titel: "Omtrek", emoji: "🐞", blok: 3,
  doel: "Ik leer wat omtrek is",
  maak(niv) {
    const soort = niv === 1 ? kies(["watis", "tellen", "tellen"])
      : niv === 2 ? kies(["tellen", "cm", "cm", "vierkant", "watis"])
      : kies(["tellen", "langste", "hek", "driehoek", "vierkant"]);

    if (soort === "watis") {
      const b = rnd(3, 4), h = rnd(2, 3);
      const cellen = rechthoekCellen(b, h);
      const opties = schud(["rand", "vlak", "lijn"]);
      return keuzeVraag({
        opdracht: "De <b>omtrek</b> is de lijn helemaal <b>rondom</b> een figuur. Bij welk plaatje is de omtrek roze?",
        uitleg: "De omtrek is de rand van de figuur, één keer helemaal rond. Niet de binnenkant en niet een lijn door het midden.",
        opties, goed: opties.indexOf("rand"), plaatje: true,
        inhoud(knop, mod) {
          const p = roosterFiguur(cellen, { modus: mod, maat: 30, schaal: 1 });
          knop.appendChild(p);
          knop.setAttribute("data-naam", mod === "rand" ? "de rand" : mod === "vlak" ? "de binnenkant" : "een lijn door het midden");
        }
      });
    }

    if (soort === "tellen") {
      let cellen;
      if (niv === 1) cellen = rechthoekCellen(rnd(1, 3), rnd(1, 2));
      else if (niv === 2) cellen = rechthoekCellen(rnd(2, 5), rnd(2, 3));
      else cellen = Math.random() < .5 ? lCellen(rnd(3, 5), rnd(2, 4)) : uCellen(rnd(3, 5), rnd(2, 3));
      const om = omtrekVan(cellen);
      const vraag = invulVraag("Het lieveheersbeestje loopt <b>één keer</b> helemaal om de figuur heen. Elk randje van een hokje is één stapje. Hoeveel stapjes is de <b>omtrek</b>?", vlak => {
        vlak.appendChild(roosterFiguur(cellen, { beestje: true }));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord("De omtrek is"));
        rij.appendChild(invoerVak());
        rij.appendChild(woord("stapjes"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [om], "Tel alle randjes langs de buitenkant, één keer rond: " + om + " stapjes. De hokjes binnenin tellen niet mee.");
      vraag.hulp = () => {
        const d = el("div", { class: "hulpvak" });
        d.appendChild(el("div", { class: "label", tekst: "Elk stipje is één stapje. Tel de stipjes!" }));
        d.appendChild(roosterFiguur(cellen, { stippen: true, maat: 30, schaal: 1 }));
        return d;
      };
      return vraag;
    }

    if (soort === "cm") {
      const b = rnd(2, 7), h = rnd(1, 5);
      const alle = niv === 2 && Math.random() < .6;
      const om = 2 * (b + h);
      return invulVraag("Hoe lang is de <b>omtrek</b> van deze rechthoek?" + (alle ? "" : " Tip: de overkant is even lang."), vlak => {
        vlak.appendChild(maatRechthoek(b, h, "cm", alle));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord("De omtrek is"));
        rij.appendChild(invoerVak());
        rij.appendChild(woord("cm"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [om], "Tel alle vier de kanten op: " + b + " + " + h + " + " + b + " + " + h + " = " + om + " cm.");
    }

    if (soort === "vierkant") {
      const z = niv === 2 ? rnd(2, 5) : rnd(4, 10);
      return invulVraag("Dit is een <b>vierkant</b>. Alle kanten zijn even lang. Hoe lang is de omtrek?", vlak => {
        vlak.appendChild(maatRechthoek(z, z, "cm", false));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord("De omtrek is"));
        rij.appendChild(invoerVak());
        rij.appendChild(woord("cm"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [4 * z], "Een vierkant heeft 4 even lange kanten: " + z + " + " + z + " + " + z + " + " + z + " = " + 4 * z + " cm.");
    }

    if (soort === "driehoek") {
      const z = [rnd(5, 9), rnd(3, 8), rnd(3, 7)];
      const om = z[0] + z[1] + z[2];
      return invulVraag("Hoe lang is de <b>omtrek</b> van deze driehoek?", vlak => {
        vlak.appendChild(maatDriehoek(z));
        const rij = el("div", { class: "rij" });
        rij.appendChild(woord("De omtrek is"));
        rij.appendChild(invoerVak());
        rij.appendChild(woord("cm"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [om], "Een driehoek heeft 3 kanten. Tel ze op: " + z.join(" + ") + " = " + om + " cm.");
    }

    if (soort === "hek") {
      const b = rnd(4, 9), h = rnd(2, 6);
      const om = 2 * (b + h);
      const tuin = kies([["de tuin", "🌷"], ["het weiland", "🐑"], ["de moestuin", "🥕"]]);
      return invulVraag("Om " + tuin[0] + " moet een hek, helemaal rondom. Hoeveel <b>meter</b> hek is er nodig?", vlak => {
        const p = maatRechthoek(b, h, "m", false, tuin[1]);
        vlak.appendChild(p);
        const rij = el("div", { class: "rij" });
        rij.appendChild(invoerVak());
        rij.appendChild(woord("meter hek"));
        vlak.appendChild(rij);
        vlak.appendChild(cijferpad());
      }, [om], "Het hek gaat langs de omtrek: " + b + " + " + h + " + " + b + " + " + h + " = " + om + " meter.");
    }

    /* langste omtrek kiezen */
    let figs;
    for (let t = 0; t < 100; t++) {
      figs = [rechthoekCellen(rnd(1, 4), rnd(1, 3)), lCellen(rnd(2, 4), rnd(2, 3)), uCellen(rnd(3, 4), rnd(2, 3))];
      const om = figs.map(omtrekVan);
      if (new Set(om).size === 3) break;
    }
    const omtrekken = figs.map(omtrekVan);
    const opties = schud([0, 1, 2]);
    const best = omtrekken.indexOf(Math.max.apply(null, omtrekken));
    return keuzeVraag({
      opdracht: "Welke figuur heeft de <b>langste omtrek</b>? Tel de randjes!",
      uitleg: "Tel bij elke figuur de randjes rondom: " + opties.map(i => omtrekken[i]).join(", ") + ". De langste is " + omtrekken[best] + ".",
      opties, goed: opties.indexOf(best), plaatje: true,
      inhoud(knop, i) {
        knop.appendChild(roosterFiguur(figs[i], { maat: 26, schaal: 1 }));
        knop.setAttribute("data-naam", "figuur met omtrek " + omtrekken[i]);
      }
    });
  }
};
