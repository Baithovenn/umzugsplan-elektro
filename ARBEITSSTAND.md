# Arbeitsstand Umzugsplan Elektroabteilung

Diese Datei ist die kurze Übergabe für die nächste Bearbeitung am Repository.

## Pflege dieser Datei

- Vor Änderungen am Projekt immer zuerst den aktuellen Stand von `data.json` lesen.
- Zusätzlich diese Datei lesen, damit klar ist, was zuletzt gemacht wurde.
- Nach einer Änderung am Repository den Abschnitt **„Letzter Stand“** aktualisieren.
- Nur kurz festhalten, was tatsächlich geändert oder entschieden wurde. Keine langen Protokolle und keine Vermutungen.
- `data.json` bleibt der einzige Datenbestand für Räume, Ausstattung, Bewegungen, Ereignisse und Audit.
- `index.html` ist die Hauptansicht (Zeitstrahl) und wird nur auf ausdrücklichen Auftrag geändert.
- `raumansicht.html` ist die Raum-/Stichtagsansicht und wird direkt ausgeliefert.
- `timeline.html` bleibt als kompatibler Direktlink erhalten und leitet auf `index.html` weiter.

## Letzter Stand

**04.09.2026**

- Zeitstrahl-Lanes fachlich korrigiert: `ev_offices_ready` („Alle Büros umzugsbereit“) und `ev_u8_elabo` („ELABO-Prüfung U8“) sind per `timelineLane:"source"` fest der oberen Voraussetzung-/Quellseite zugeordnet. Die Änderung ist in `data.json` mit `updatedAt` und Audit dokumentiert.
- Veralteten eingebetteten Daten-Fallback aus `raumansicht.html` vollständig entfernt. Die Raumansicht startet ohne Ersatzdaten und rendert erst nach erfolgreichem Laden von `data.json`; beim ersten Abruffehler erscheint ein deutlicher Hinweis „Aktueller Plan konnte nicht geladen werden“ mit Neu-laden-Knopf. Drucken bleibt bis zum erfolgreichen Laden deaktiviert. Scheitert nur eine spätere Aktualisierung, bleibt der bereits geladene Datenstand sichtbar und wird mit seinem Zeitstempel benannt.
- README auf den zentralen Datenstand ohne Fallback angepasst. Temporäre Patch-Workflows wurden nach der Änderung wieder entfernt.

**03.09.2026**

- Raumansicht Druck: Die am gewählten Stichtag als Nächstes anstehenden Ausstattungsbewegungen werden nun auch im Ausdruck orange hervorgehoben; die Drucklegende enthält „als Nächstes“. Bildschirmansicht und `data.json` unverändert.

- Raumansicht Drucklayout geändert: Blatt 1 enthält ausschließlich FI-U1 bis FI-U9 im 3×3-Raster; Blatt 2 enthält Büro A1, Büro A2 und Küche/Nebenbereich. Bildschirmansicht und `data.json` unverändert.

- Zeitstrahl V1.6: Druck ab Heute in `timeline-ui.js`. `beforeprint` baut ein Fenster aus den Knoten ab Heute (Zeiträume, die Heute noch enthalten, zählen mit): so viele Knoten, wie bei Maßstab ≥ 0,8 vollständig auf ein Blatt A3 quer passen (1500 × 1000 px bedruckbar angenommen), eigenes Layout für diese Teilmenge, kein Anschnitt, Maßstab höchstens 1,0. Kopfzeile: Datenstand, Druckdatum, Zeitraum, „weiter mit … am Bildschirm“. Ohne-Termin-Block wird nicht gedruckt. `afterprint` stellt Bildschirmfläche, Scrollposition und Kopfzeile wieder her. Stand heute: Blatt zeigt 03.–15.09. bei Maßstab 0,83. `data.json` unverändert.
- Zeitstrahl V1.5: Kartentexte vergrößert (Titel 14 px, Raum/Zuständigkeit und Datum 12 px, Zusatzzeile 11,5 px, Datumspillen 12,5 px), dafür Kartenhöhe 80 px und Zeilenabstand 90 px in `GEO`. Fläche wird bei 5 Zeilen je Seite 80 px höher, Breite unverändert; kein Text abgeschnitten, Kreuzungsbild unverändert. Nur `timeline.css`, `timeline-engine.js` (zwei Zahlen) und die Versionsangabe in `index.html` geändert, `data.json` unverändert. Grund: Druck ab Heute auf A3 quer soll bei Maßstab 1,0 Handout-Größe (10,5 pt Titel) erreichen.
- Zeitstrahl V1.4: Die Zielkarten unterhalb der Achse werden von rechts nach links zeilenweise vergeben. Spätere Termine dürfen näher an der Achse liegen; frühere Karten weichen nach unten aus, wenn sie sonst den Ast-/Stapelbereich eines späteren Knotens überdecken. Dadurch werden die missverständlichen Astdurchläufe auf der FI-Seite ohne zusätzliche Höhe vermieden. Die obere Quellseite bleibt bewusst in ihrer bisherigen kompakten Anordnung. Für wartbare Diffs wurden Styles und JavaScript aus `index.html` in `timeline.css`, `timeline-engine.js` und `timeline-ui.js` ausgelagert. `data.json` blieb unverändert.
- Technische Bereinigung nach Review: `index.html` und `raumansicht.html` werden wieder direkt ausgeliefert. Die Laufzeit-Loader mit `fetch`, String-Ersetzungen und `document.write` sind entfernt; die alten Basisdateien wurden gelöscht. `timeline.html` ist nur noch ein Kompatibilitäts-Redirect auf die Hauptansicht.
- Zeitstrahl auf V1.3: Die Wort-Regex für „Umfang/Ausstattung noch offen“ wurde entfernt. FI-Raumkarten ohne konkrete Einzelbewegung zeigen neutral „keine Einzelbewegung hinterlegt“, statt aus Titel oder Notiz einen offenen Umfang zu erraten. Die obere Quellseite bleibt bewusst kompakt; dort tolerierte Astdurchläufe wurden nach visueller Prüfung als eindeutig lesbar bewertet. `data.json` blieb unverändert.
- Vertikales Draggen im Zeitstrahl wieder entfernt: Drag auf freier Zeitfläche verschiebt nur horizontal den Zeitstrahl. Vertikal wird wieder normal über Mausrad/Touchpad bzw. Seiten-Scroll gescrollt. Karten und Bedienelemente bleiben klickbar.
- Ansichten neu geordnet: `index.html` ist jetzt die Hauptansicht Zeitstrahl; die bisherige Raumansicht ist über `raumansicht.html` erreichbar. Beide sichtbaren Ansichten haben eine Navigation `Zeitstrahl | Raumansicht`; Änderungen/Bedienung bleiben in der Raumansicht erhalten.
- Zeitstrahl V1.1: obere Karten liegen links vor ihrem Datumsknoten und laufen über weiche Kurven organisch auf ihn zu; untere FI-Karten liegen rechts hinter dem Knoten und laufen vom Knoten weg. Linker Vorlauf vergrößert, Heute wird beim Laden etwa im linken Viertel des sichtbaren Bereichs positioniert. Nicht-FI-Ziele wie Baumgartenstraße/Verschrottung werden auf der Quellseite dargestellt; bei betroffenen FI-Räumen ohne Move steht der Raumzustand statt pauschal „keine Ausstattung eingetragen“.
- Zeitstrahl V1 angelegt (Fischgräte). Regeln: ein Knoten je Starttag, Beschriftung „von–bis" wenn Ereignisse dort ein `endDate` haben; Abstände 1–5 Einheiten je nach Tagesdifferenz, ab 15 Tagen Zeitbruch; oben eine Karte je Ereignis (Quellseite), unten eine Karte je Termin × Zielraum aus allen Bewegungen dieses Termins; stornierte Ereignisse und Bewegungen werden nicht gezeigt; „Noch ohne Termin" mit Ereigniskarten und aggregierter Ausstattung. Seite oben/unten per Heuristik, `timelineLane` wird gelesen, ist aber zu diesem Stand noch nirgends gesetzt. Druck A3 quer als Fit-to-width, dadurch klein; schmale Bildschirme bekommen eine senkrechte Liste.
- Sicherheitsstand vor der Terminplan-Aktualisierung als Branch `backup-2026-09-03-vor-terminupdate` gesichert (Stand `0708272`).
- Aktuellen abgestimmten Terminplan für FI/HRS eingearbeitet: Räume 1–4, Grundreinigung, Umzugswelle 14.–15.09., F7, F8, Büros und späte Umzugsphase ab 26.10.
- FI-U5/FI-U6 korrigiert: 12 Tische aus HR-U4 nach F5, 9 Tische aus HR-U11 nach F6; Industrie 4.0 nach F6. Dozententische und Clevertouch-Zuordnung F5/F6 bleiben wie geplant.
- Zwei Seitentische aus HR-U4 als Pulte für FI-U7 und FI-U8 bis 04.09. eingeplant.
- FI-U1 vorerst ohne Clevertouch, da das vorgesehene Gerät aus HR-13 defekt ist. Bisherige CT-HR4-Interimsbewegungen storniert; aktuelle Zuordnung offen.
- FI-U8: vorhandene Einbauschränke ergänzt; zusätzlicher Schrankumfang aus HR-3 bleibt offen.
- Widersprüchliche bzw. nicht mehr belastbare Termine für FI-U3, CT-HR12 und den späteren Wechsel Heilig/Albrecht auf offen gesetzt.

**02.09.2026**

- Viewer ergänzt: Nächster tatsächlicher Bewegungstermin wird dezent hellorange in den Raumkarten angedeutet; der ausgewählte Termin bleibt kräftig orange. Quellen erhalten eine leichte Auszugs-Andeutung. Drucklayout unverändert.
- Viewer-Layout auf Desktop/Laptop korrigiert: vertikales Scrollen erlaubt, Raumkarten wachsen vollständig mit ihrem Inhalt und der Zeitstrahl folgt nach den Räumen. Drucklayout A3/A4 unverändert.
- Projekt auf GitHub und GitHub Pages umgestellt.
- `index.html` als reiner Viewer in Version 2.0 angelegt (später am 03.09. zur Raumansicht ausgelagert).
- `data.json` als zentralen Datenbestand eingerichtet.
- Viewer lädt den aktuellen Stand aus `data.json`; ein eingebetteter Stand diente zu diesem Zeitpunkt als Fallback.
- `README.md` mit Zweck, Rollen und Pflegeregeln ergänzt.
- `.nojekyll` für GitHub Pages angelegt.
- Diese Datei `ARBEITSSTAND.md` als kurze Übergabe für künftige Bearbeitungen ergänzt.

## Aktuelle Ablage

- Repository: `Baithovenn/umzugsplan-elektro`
- Branch: `main`
- Hauptansicht / Zeitstrahl: https://baithovenn.github.io/umzugsplan-elektro/
- Raumansicht: https://baithovenn.github.io/umzugsplan-elektro/raumansicht.html
- Alter Zeitstrahl-Direktlink: https://baithovenn.github.io/umzugsplan-elektro/timeline.html
- Datenbestand: `data.json`
