# Arbeitsstand Umzugsplan Elektroabteilung

Diese Datei ist die kurze Übergabe für die nächste Bearbeitung am Repository.

## Pflege dieser Datei

- Vor Änderungen am Projekt immer zuerst den aktuellen Stand von `data.json` lesen.
- Zusätzlich diese Datei lesen, damit klar ist, was zuletzt gemacht wurde.
- Nach einer Änderung am Repository den Abschnitt **„Letzter Stand“** aktualisieren.
- Nur kurz festhalten, was tatsächlich geändert oder entschieden wurde. Keine langen Protokolle und keine Vermutungen.
- `data.json` bleibt der einzige Datenbestand für Räume, Ausstattung, Bewegungen, Ereignisse und Audit.
- `index.html` nur auf ausdrücklichen Auftrag ändern.
- `timeline.html` ist die zweite Ansicht (Zeitstrahl); Layoutregeln stehen im Kommentar des Engine-Skripts und unten im Stand vom 03.09.2026.

## Letzter Stand

**03.09.2026**

- `timeline.html` V1 angelegt (Zeitstrahl, Fischgräte). Regeln: ein Knoten je Starttag, Beschriftung „von–bis" wenn Ereignisse dort ein `endDate` haben; Abstände 1–5 Einheiten je nach Tagesdifferenz, ab 15 Tagen Zeitbruch; oben eine Karte je Ereignis (Quellseite), unten eine Karte je Termin × Zielraum aus allen Bewegungen dieses Termins, Räume aus `affectedRooms` ohne Bewegung erscheinen mit „keine Ausstattung eingetragen"; Zeilen werden von rechts nach links vergeben, damit kein Stiel eine fremde Karte kreuzt; stornierte Ereignisse und Bewegungen werden nicht gezeigt; „Noch ohne Termin" mit Ereigniskarten und aggregierter Ausstattung (Herkunft `OFFEN`/`BESCHAFFUNG` nach Kategorie gezählt). Seite oben/unten per Heuristik, `timelineLane` wird gelesen, ist aber noch nirgends gesetzt. Druck A3 quer als Fit-to-width, dadurch klein; schmale Bildschirme bekommen eine senkrechte Liste. `index.html` und `data.json` unverändert.
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
- `index.html` als reiner Viewer in Version 2.0 angelegt.
- `data.json` als zentralen Datenbestand eingerichtet.
- Viewer lädt den aktuellen Stand aus `data.json`; ein eingebetteter Stand dient als Fallback.
- `README.md` mit Zweck, Rollen und Pflegeregeln ergänzt.
- `.nojekyll` für GitHub Pages angelegt.
- Diese Datei `ARBEITSSTAND.md` als kurze Übergabe für künftige Bearbeitungen ergänzt.

## Aktuelle Ablage

- Repository: `Baithovenn/umzugsplan-elektro`
- Branch: `main`
- Live-Ansicht: https://baithovenn.github.io/umzugsplan-elektro/
- Datenbestand: `data.json`
- Viewer: `index.html`
- Zeitstrahl: `timeline.html` — https://baithovenn.github.io/umzugsplan-elektro/timeline.html
