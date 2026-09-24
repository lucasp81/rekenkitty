/* =========================================================================
   app.js - de schermen, de oefenronde en de puntentelling

   Een ronde is tien vragen. Bij "Blok 2" (of "Blok 1") komen alle tien de
   lesdoelen van dat blok een keer langs, in willekeurige volgorde. "Door elkaar"
   neemt vijf lesdoelen uit elk blok.
   Alles past op één liggend tabletscherm; er hoeft nooit gescrold te worden.
   ========================================================================= */
"use strict";

const VRAGEN_PER_RONDE = 10;
const RONDESOORTEN = {
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
    links.appendChild(el("p", { class: "klein", tekst: "Tien vragen door elkaar. Wat wil je oefenen?" }));
    links.appendChild(el("button", {
      class: "knop groot", type: "button", tekst: "▶ Blok 2",
      onclick: () => { Geluid.klik(); Motor.begin(false, "blok2"); }
    }));
    links.appendChild(el("div", { class: "rij", stijl: "gap:10px" }, [
      el("button", {
        class: "knop stil", type: "button", tekst: "Blok 1 herhalen",
        onclick: () => { Geluid.klik(); Motor.begin(false, "blok1"); }
      }),
      el("button", {
        class: "knop stil", type: "button", tekst: "🔀 Door elkaar",
        onclick: () => { Geluid.klik(); Motor.begin(false, "mix"); }
      })
    ]));
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
function toonOuders() {
  Motor.actief = false;
  scherm.innerHTML = "";
  onderbalk.innerHTML = "";
  onderbalk.className = "";
  const kaart = el("div", { class: "kaart schuif" });
  kaart.innerHTML =
    "<h2 class='titelregel'>Voor papa, mama of de juf</h2>" +
    "<p class='klein'>Elke ronde bestaat uit tien vragen. Kiest ze <b>Blok 2</b> of <b>Blok 1</b>, dan komen de tien lesdoelen " +
    "van dat blok van <i>Alles telt Q, groep 4</i> elk één keer langs, in willekeurige volgorde. <b>Door elkaar</b> neemt " +
    "vijf lesdoelen uit elk blok. Door elkaar oefenen blijft beter hangen dan tien keer hetzelfde soort som.</p>" +
    "<p class='klein'>Elk lesdoel heeft een eigen niveau (1, 2 of 3) dat meebeweegt: twee keer achter elkaar in één keer goed " +
    "en het wordt moeilijker, een fout maakt het weer makkelijker. Bij een fout mag ze het altijd eerst nog een keer zelf " +
    "proberen; pas daarna volgt het antwoord met uitleg. Er staat geen klok bij.</p>";
  const tabel = el("table", { class: "oudertabel" });
  let html = "";
  [["Blok 2", SPELVOLGORDE_BLOK2], ["Blok 1", SPELVOLGORDE]].forEach(([blok, ids]) => {
    html += "<tr><th>" + blok + "</th><th>Niveau</th><th>In één keer goed</th></tr>";
    ids.forEach(id => {
      const s = Voortgang.statsVan(id);
      const pct = s.totaal ? Math.round(s.goed / s.totaal * 100) + "%" : "–";
      html += "<tr><td>" + SPELLEN[id].doel + "</td><td>" + Voortgang.niveauVan(id) +
        "</td><td>" + s.goed + " / " + s.totaal + " <span class='klein'>(" + pct + ")</span></td></tr>";
    });
  });
  tabel.innerHTML = html;
  kaart.appendChild(tabel);
  kaart.appendChild(el("p", {
    class: "klein",
    html: "Totaal: <b>" + Voortgang.punten + "</b> punten, " + Voortgang.rondes + " afgeronde rondes, " +
      Voortgang.verdiend() + " van de " + STICKERS.length + " stickers. " +
      "De voortgang staat in de browser van dit apparaat en blijft bewaard als de pagina ververst wordt."
  }));
  kaart.appendChild(el("div", { class: "midden" }, [
    el("button", {
      class: "knop stil", type: "button", tekst: "Alles wissen en opnieuw beginnen",
      onclick() {
        if (confirm("Alle punten, stickers en niveaus wissen?")) { Voortgang.wisAlles(); toonStart(); }
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
  actief: false, soort: "blok2", volgorde: [], nr: 0, puntenRonde: 0, goedOpRij: 0, resultaten: [],
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
    } else {
      this.soort = RONDESOORTEN[soort] ? soort : "blok2";
      this.volgorde = RONDESOORTEN[this.soort].maak();
      this.nr = 0; this.puntenRonde = 0; this.goedOpRij = 0; this.resultaten = [];
      if (Voortgang.nieuweDag()) {
        Voortgang.telPunten(BONUS_NIEUWE_DAG);
        this.puntenRonde += BONUS_NIEUWE_DAG;
        setTimeout(() => melding("Eerste ronde van vandaag! +" + BONUS_NIEUWE_DAG + " punten 🔥", 2600), 400);
      }
    }
    this.actief = true;
    this.volgende();
  },

  bewaarStand() {
    Voortgang.bewaarRonde({
      soort: this.soort, volgorde: this.volgorde, nr: this.nr, punten: this.puntenRonde,
      goedOpRij: this.goedOpRij, resultaten: this.resultaten
    });
  },

  volgende() {
    if (this.nr >= VRAGEN_PER_RONDE || this.nr >= this.volgorde.length) return this.einde();
    this.doel = this.volgorde[this.nr];
    this.niveau = Voortgang.niveauVan(this.doel);
    this.vraag = SPELLEN[this.doel].maak(this.niveau);
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
    links.appendChild(poesjeOfPlaatje(kies(EIGEN_PLAATJES.beloningen), 120));
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
      onclick: () => this.begin(false, this.soort)
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
