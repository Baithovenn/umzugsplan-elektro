# Umzugsplan Elektroabteilung — Heinz-Rühmann-Straße → Finninger Straße

Interaktiver Umzugsplan der Elektroabteilung (IHK Akademie Schwaben), Umzugszeitraum September–Oktober 2026.

**Live-Ansicht:** https://baithovenn.github.io/umzugsplan-elektro/

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Reiner Viewer: Raumbild Finninger Straße, Zeitstrahl mit Ereignissen, Popover-Details, Druck A3/A4 quer. Keine Bearbeitungsfunktionen. |
| `timeline.html` | Zweite Ansicht auf dieselben Daten: waagerechter Zeitstrahl (Fischgräte). Oben Voraussetzungen und Quellseite (HR, Fremdfirmen, IT, Elektro), unten Ankunft und Nutzung in FI je Termin × Zielraum, dazu der Bereich „Noch ohne Termin". Liest ausschließlich `data.json`, kein eingebetteter Stand. Live: https://baithovenn.github.io/umzugsplan-elektro/timeline.html |
| `data.json` | Der einzige Datenbestand: Räume, Ausstattung, Bewegungen, Ereignisse, Änderungsprotokoll. Jede Pflege ist ein Commit auf diese Datei. |

Der Viewer lädt `data.json` beim Öffnen, alle 5 Minuten und beim Zurückwechseln auf den Tab neu (F5 erzwingt sofort). Ist `data.json` nicht erreichbar (z. B. lokal per Doppelklick geöffnet), zeigt er den in der Datei eingebetteten Stand und weist darauf hin.

## Rollen

- **Hr. Lautier-Skanda** (Abteilungsleiter): nutzt den Link, meldet Änderungen an Hrn. Sauter.
- **Hr. Sauter**: pflegt den Plan zentral (über Claude, das direkt in dieses Repo schreibt).

## Pflegeregeln für `data.json`

1. Bei jeder Änderung `updatedAt` auf den aktuellen Zeitpunkt setzen (ISO 8601, UTC) und oben in `audit` einen Eintrag anfügen: `{at, actor, text}`.
2. IDs niemals ändern. Nichts löschen — stattdessen `status:"cancelled"` (Ereignisse/Bewegungen) bzw. `active:false` (Ausstattung/Orte).
3. Termin unbekannt → `date:""` (erscheint als „Ereignis ohne Datum"). Termin geschätzt → `estimated:true` (erscheint mit ≈).
4. Umzug erledigt → `move.status:"done"` plus `actualDate:"JJJJ-MM-TT"`. Ereignis komplett erledigt → `event.status:"done"` und die zugehörigen Bewegungen ebenfalls auf `done`.
5. Eine Bewegung hängt entweder an einem Ereignis (`eventId` gesetzt, `date` leer) oder an einem Einzeltermin (`date` gesetzt, `eventId` leer).
6. `index.html` nicht ohne ausdrücklichen Auftrag ändern — die Ansicht ist abgenommen.
7. Die Seite eines Ereignisses im Zeitstrahl (oben/unten) wird automatisch abgeleitet: Bewegungen dran → unten; keine `affectedRooms` → oben; sonst Elektrofirma/IT → oben, alles andere unten. Liegt ein Ereignis falsch, `timelineLane:"source"` bzw. `"target"` am Ereignis setzen — nur als Ausnahme, nicht flächendeckend. `index.html` ignoriert das Feld.

## Schema (Kurzform)

`categories` · `people` · `locations` (visible: `main`/`side`/`source`) · `events {id, title, date, endDate, status, estimated?, timelineLane?, responsible, affectedRooms[], note}` · `assets {id, label, category, initialLocation, note, active}` · `moves {id, assetId, from, to, eventId, date, status: open|planned|ready|done|cancelled, actualDate, responsible, note}` · `audit[]`
