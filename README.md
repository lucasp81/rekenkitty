# Rekenkitty

Een rekenoefenapp voor groep 4, gemaakt bij de lesdoelen van **Alles telt Q, groep 4, blok 1 en blok 2**.
Bedoeld voor een tablet in liggende stand: alles gaat met tikken en slepen, er komt nooit een
schermtoetsenbord in beeld en er hoeft nooit gescrold te worden.

Eén ronde is tien vragen. Op het startscherm kiest ze **Blok 2**, **Blok 1 herhalen** of **Door
elkaar**. Bij een blok komen alle tien de lesdoelen van dat blok één keer voorbij, in willekeurige
volgorde; "Door elkaar" neemt vijf lesdoelen uit elk blok. Door elkaar oefenen blijft beter hangen
dan tien keer hetzelfde soort som.

## Wat er geoefend wordt in blok 2

| Lesdoel | Wat ze doet |
| --- | --- |
| Ik oefen optellen en aftrekken over het tiental | tot 20, daarna tot 100 (47 + 5, 63 − 8); ook in twee stappen via het tiental |
| Ik herken hoe een vierkant en een kubus bij elkaar horen | vierkant of kubus aanwijzen, stempelen met een kubus, 6 vierkanten tellen, de goede bouwplaat kiezen |
| Ik oefen herhaald optellen | rijtjes (4 rijen van 5), sprongen op de getallenlijn, plussommen opschrijven, verhaaltjes |
| Ik oefen klokkijken met hele en halve uren | klok aflezen, de goede klok kiezen, zelf de klok zetten, een half uur later/eerder |
| Ik verdeel kleine hoeveelheden eerlijk | uitdelen over bordjes (vanaf niveau 3 met rest) |
| Ik leer over de waarde van geld | munten en briefjes herkennen, wat is meer waard, hoeveel munten van 50 cent is 1 euro, ordenen |
| Ik reken met geld | geld tellen in euro's, precies betalen, samen kosten, wisselgeld, "heb ik genoeg?" |
| Ik leer tabellen en diagrammen gebruiken | pictogram, staafdiagram en turftabel aflezen: hoeveel, meeste/minste, verschil, totaal |
| Ik verdeel hoeveelheden tot en met 100 | tienstaven en blokjes uitdelen (op niveau 3 met inwisselen), de helft, verhaaltjes |
| Ik leer patronen spiegelen | een patroon aan de andere kant van de spiegellijn afmaken, of het goede spiegelbeeld kiezen |

Het ×-teken en het :-teken worden niet gebruikt; herhaald optellen en verdelen staan steeds als
plussom of in woorden.

De munten zijn getekend in hun echte verhoudingen: de munt van 50 cent is groter dan die van
1 euro. Daar zitten bewust vragen over.

## Wat er geoefend wordt in blok 1

| Lesdoel | Wat ze doet |
| --- | --- |
| Ik tel tot en met 100 | gaten invullen in het honderdveld, buurgetallen, terugtellen |
| Ik leer wat een centimeter is | meten op een liniaal, en zelf een lint op maat maken |
| Ik leer getallen splitsen in tientallen en eenheden | met tientallen-staven en losse blokjes |
| Ik kan tellen met sprongen | rijen van 2, 5 en 10, vooruit en terug |
| Ik oefen optellen en aftrekken | tot 10, over het tiental heen, en met tientallen tot 100 |
| Ik leer munten van 5, 10, 20 en 50 cent gebruiken | geld tellen en precies afrekenen |
| Ik leer herhaald optellen | groepjes tellen: 4 groepjes van 3 |
| Ik leer over aanzichten | boven- en vooraanzicht van een blokkenbouwwerk |
| Ik kan optellen en aftrekken met hulp van een getallenlijn | met zichtbare sprongen van 10 en 1 |
| Ik leer over seizoenen en maanden | maanden bij het goede seizoen, volgorde van het jaar |

Elk lesdoel heeft een eigen niveau (1, 2 of 3) dat meebeweegt: twee keer achter elkaar in één keer
goed en het wordt moeilijker, een fout maakt het weer makkelijker. Bij een fout mag ze het altijd
eerst nog een keer zelf proberen; pas daarna volgt het antwoord met uitleg. Er staat geen klok bij.

## Punten, niveaus en stickers

* **10 punten** voor een antwoord dat in één keer goed is, **5** als het bij de tweede poging lukt.
* **+10 bonus** bij elke drie goede antwoorden op rij.
* **+20 bonus** voor de eerste ronde van de dag; het vlammetje 🔥 telt de dagen op rij.
* Elke **100 punten** een niveau hoger, met een nieuwe naam: van Rekenpoesje via Rekenlegende tot Rekengenie (en daarna "Rekenlegende met kroon").
* Elke **60 punten** een nieuwe sticker voor de stickerkast (32 in totaal; de laatste 16 zijn er
  bij blok 2 bijgekomen). Had ze al alle 16 oude stickers, dan verdient ze de nieuwe vanaf nu,
  gewoon elke 60 punten één.

Alles wordt na élke vraag opgeslagen in de browser van de tablet. Wordt de pagina per ongeluk
ververst, dan zijn de punten er nog gewoon en gaat de ronde verder waar hij gebleven was.

## Op GitHub zetten

1. Maak op github.com een nieuwe repository, bijvoorbeeld `rekenkitty` (mag publiek of privé —
   voor GitHub Pages op een gratis account moet hij **publiek** zijn).
2. Zet de inhoud van deze map erin. Via de opdrachtregel, vanuit deze map:

   ```bash
   git init
   git add .
   git commit -m "Rekenkitty"
   git branch -M main
   git remote add origin https://github.com/JOUWNAAM/rekenkitty.git
   git push -u origin main
   ```

   Liever zonder opdrachtregel? Kies op github.com **Add file → Upload files** en sleep alle
   mappen en bestanden uit deze map naar het venster.
3. Ga in de repository naar **Settings → Pages**. Kies bij *Source* de optie **Deploy from a
   branch**, branch `main` en map `/ (root)`. Opslaan.
4. Na een minuut staat de app op `https://JOUWNAAM.github.io/rekenkitty/`.

Later iets aangepast? Push de wijziging en zet in `sw.js` het nummer bij `VERSIE` één hoger
(nu staat er `rekenkitty-v2`; de volgende keer wordt dat `rekenkitty-v3`). Dan haalt de tablet de nieuwe versie op in plaats van de
opgeslagen oude.

## Op de tablet zetten

Open de link één keer in de browser van de tablet en zet hem op het beginscherm:

* **iPad (Safari)**: deelknop → *Zet op beginscherm*.
* **Android (Chrome)**: menu ⋮ → *Toevoegen aan startscherm*.

Hij opent dan schermvullend als een echte app, zonder adresbalk — dat scheelt ruimte en er valt
niets meer per ongeluk te verversen. De app werkt daarna ook zonder internet.

> De punten staan in de browser van dat ene apparaat. Op een andere tablet of in een andere browser
> begint ze weer bij nul; de app zelf werkt daar gewoon.

## Eigen plaatjes

In de map `plaatjes` kun je eigen plaatjes zetten:

```
plaatjes/kitty.png       het poesje in de kop en op het beginscherm
plaatjes/beloning1.png   wordt na een ronde getoond
plaatjes/beloning2.png
plaatjes/beloning3.png
```

Staan ze er niet, dan tekent de app zelf een poesje — er gaat dus nooit iets stuk. Let op dat
plaatjes van bestaande figuren auteursrechtelijk beschermd zijn: prima voor de eigen tablet thuis,
maar zet ze niet in een publieke repository.

## Wat staat waar

```
index.html                de pagina zelf
css/stijl.css             de opmaak (alles past op één liggend scherm)
js/kern.js                hulpjes, geluid, slepen en tikken, de tekeningen
js/voortgang.js           punten, niveaus, stickers, dagreeks en het bewaren
js/spellen.js             een vraaggenerator per lesdoel van blok 1
js/spellen2.js            een vraaggenerator per lesdoel van blok 2
js/app.js                 de schermen, de ronde en de puntentelling
iconen/                   app-iconen (en maak-iconen.py om ze opnieuw te tekenen)
plaatjes/                 hier kun je eigen plaatjes neerzetten
manifest.webmanifest      zodat hij als app op het beginscherm kan
sw.js                     zorgt dat hij ook zonder internet werkt
```

Er zijn geen externe bibliotheken en geen bouwstappen: het is gewone HTML, CSS en JavaScript.
Je kunt `index.html` ook gewoon lokaal openen om iets te proberen.

Gemaakt voor thuisgebruik.
