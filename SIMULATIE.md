# Simulatie van de kostencurve

Dit document legt uit hoe de economie van **Little Hollow** werkt, hoe het spel normaal verloopt en hoe het simulatiescript (`scripts/simulate.js`) gebruikt werd om de prijzen te kiezen.

## Wat er normaal in het spel gebeurt

Dit is het verloop voor een speler die altijd de slimste aankoop doet en 5 keer per seconde klikt (zie de simulatie hieronder).

| Tijd | Wat gebeurt er | Productie |
| --- | --- | --- |
| 0:00 | Eerste klik-upgrade (Gloves), dan farm, mine en factory | 7 punten/s |
| 0:04 | Railway | 154 punten/s |
| 0:11 | Harbor | 1 705 punten/s |
| 0:21 | Bank | 16 774 punten/s |
| 0:34 | Laboratory | 142 061 punten/s |
| 0:57 | Observatory | 876 884 punten/s |
| 1:12 | Spaceport | 4,4 miljoen punten/s |
| 1:43 | **Hollow rift** | 28 miljoen punten/s |

De speler begint dus met klikken. Na enkele minuten komen de meeste punten van de buildings, en klikken wordt minder belangrijk. Tussen twee nieuwe buildings koopt de speler upgrades, zodat er bijna altijd iets nieuws te ontdekken is. De langste wachttijden (ongeveer 20 minuten) zitten aan het einde: dat is de uitdaging van het spel.

**Hollow Awakening** (globale upgrade, 150 miljard) is bewust duurder dan de hollow rift. Het is een doel voor spelers die na het einde verder willen spelen.

Een echte speler klikt niet perfect en kiest niet altijd de beste aankoop. Voor een echte speler duurt het spel dus langer dan 1u43, waarschijnlijk 2 tot 3 uur.

## Waarom een simulatie?

Het is onmogelijk om bij elke kleine prijswijziging 2 uur te spelen om te testen. Het script speelt het spel in de plaats daarvan, seconde per seconde, maar zonder te wachten: uren speeltijd worden in ongeveer een seconde berekend.

## Hoe het script werkt

Het script draait in **Node**, zonder Phaser en zonder browser. Dat kan omdat `src/data/buildings.js` en `src/data/upgrades.js` gewone JavaScript-bestanden zijn die Phaser niet gebruiken.

1. **Dezelfde data en formules als het spel.** Het script importeert `BUILDINGS` en `UPGRADES` en gebruikt dezelfde formules als `GameScene.js`: prijs, klikkracht, productie per building en beschikbaarheid van upgrades.
2. **Een slimme speler.** Op elk moment bekijkt de speler alle mogelijke aankopen en kiest die met de kortste **terugverdientijd**:

   ```
   terugverdientijd = prijs / extra punten per seconde
   ```

   Voorbeeld: een farm kost 15 en geeft 0,3 punten/s, dus ze is na 50 seconden terugverdiend. Om de winst van een aankoop te meten, doet het script de aankoop even (`apply`), meet de productie en draait ze terug (`undo`). Zo werkt dezelfde code voor buildings én upgrades.
3. **Een tijdlus.** Elke gesimuleerde seconde krijgt de speler zijn productie plus zijn klikken. Daarna koopt hij zolang hij de beste aankoop kan betalen.
4. **De uitvoer.** Het script toont alleen de **eerste** aankoop van elk building en elke upgrade, met de tijd en de productie op dat moment. Het stopt zodra de hollow rift gekocht is.

## Het script uitvoeren

Vanuit de map van het project:

```
node scripts/simulate.js
```

Voorbeeld van de uitvoer:

```
0h00  [upgrade] Gloves                  0 points/s
0h00  farm                              0 points/s
0h04  railway                           154 points/s
...
1h43  hollow rift                       28047110 points/s

Final count: farm: 46, mine: 44, factory: 44, ...
```

Bovenaan in het script staan instellingen die je kunt aanpassen:

| Instelling | Waarde | Betekenis |
| --- | --- | --- |
| `CLICKS_PER_SECOND` | 5 | Hoe snel de gesimuleerde speler klikt |
| `MAX_HOURS` | 10 | Na hoeveel uur de simulatie zeker stopt |
| `COST_GROWTH` | 1,15 | Hoeveel duurder een building wordt na elke aankoop |
| `TIER_FACTOR` | 1 | Test: vermenigvuldigt de prijs van elk building met deze factor per rang. Op 1 = de echte prijzen uit `buildings.js` |

## Welke keuzes de simulatie opleverde

| Test | Resultaat | Beslissing |
| --- | --- | --- |
| Oorspronkelijke prijzen | Hollow rift na 38 minuten, farm pas als vierde gekocht | Te makkelijk |
| `COST_GROWTH` 1,15 → 1,2 | 41 minuten | Bijna geen effect, niet gehouden |
| Prijs per rang × 1,3 | 2u13, maar 50 minuten zonder iets nieuws (de speler spaarde voor Hollow Awakening) | Prijzen gehouden |
| + Hollow Awakening 40 → 150 miljard, farm 0,2 → 0,3 punten/s | **1u43**, farm is de eerste aankoop, geen lange lege periode meer | **Gekozen** |

De belangrijkste les: niet de prijsstijging per aankoop bepaalt hoe lang het spel duurt, maar het **prijsverschil tussen de buildings**.

## Beperkingen

- De gesimuleerde speler is perfect: hij rekent altijd de beste aankoop uit en verliest geen tijd. Echte spelers zijn trager.
- Een opgeslagen spel, pauzes en offline tijd worden niet gesimuleerd.
- Als de formules in `GameScene.js` veranderen, moeten ze ook in het script aangepast worden, anders klopt de simulatie niet meer.
