# Umzugsplan Elektroabteilung — Heinz-Rühmann-Straße → Finninger Straße

Interaktiver Umzugsplan der Elektroabteilung (IHK Akademie Schwaben), Umzugszeitraum September–Oktober 2026.

**Live-Ansicht:** https://baithovenn.github.io/umzugsplan-elektro/

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Hauptansicht: waagerechter Zeitstrahl (Fischgräte). Oben Voraussetzungen und Quellseite (HR, Fremdfirmen, IT, Elektro), unten Ankunft und Nutzung in FI je Termin × Zielraum, dazu „Noch ohne Termin“. Wird direkt ausgeliefert und liest `data.json`. |
| `raumansicht.html` | Zweite Ansicht: Raumbild Finninger Straße zum gewählten Stichtag, kleiner Zeitstrahl mit Ereignissen, Popover-Details und Druck A3/A4 quer. Wird direkt ausgeliefert und besitzt zusätzlich einen eingebetteten Fallback-Datenstand für die lokale Nutzung. |
| `timeline.html` | Kompatibilitätslink für ältere Zeitstrahl-URLs; leitet direkt auf `index.html` weiter. |
| `data.json` | Der einzige Datenbestand: Räume, Ausstattung, Bewegungen, Ereignisse, Änderungsprotokoll. Jede Datenpflege ist ein Commit auf diese Datei. |

Beide Ansichten lesen den aktuellen Stand aus `data.json`. Es gibt keine vorgeschalteten Loader- oder Basisdateien mehr. Die Raumansicht besitzt weiterhin ihren bisherigen eingebetteten Fallback, falls `data.json` lokal nicht erreichbar ist.

## Rollen

- **Hr. Lautier-Skanda** (Abteilungsleiter): nutzt den Link, meldet Änderungen an Hrn. Sauter.
- **Hr. Sauter**: pflegt den Plan zentral.

## Pflegeregeln für `data.json`

1. Bei jeder Änderung `updatedAt` auf den aktuellen Zeitpunkt setzen (ISO 8601, UTC) und oben in `audit` einen Eintrag anfügen: `{at, actor, text}`.
2. IDs niemals ändern. Nichts löschen — stattdessen `status:"cancelled"` (Ereignisse/Bewegungen) bzw. `active:false` (Ausstattung/Orte).
3. Termin unbekannt → `date:""` (erscheint als „Ereignis ohne Datum"). Termin geschätzt → `estimated:true` (erscheint mit ≈).
4. Umzug erledigt → `move.status:"done"` plus `actualDate:"JJJJ-MM-TT"`. Ereignis komplett erledigt → `event.status:"done"` und die zugehörigen Bewegungen ebenfalls auf `done`.
5. Eine Bewegung hängt entweder an einem Ereignis (`eventId` gesetzt, `date` leer) oder an einem Einzeltermin (`date` gesetzt, `eventId` leer).
6. Viewer-Dateien nur auf ausdrücklichen Auftrag ändern.
7. Die Seite eines Ereignisses im Zeitstrahl (oben/unten) wird automatisch abgeleitet. Liegt ein Ereignis falsch, `timelineLane:"source"` bzw. `"target"` am Ereignis setzen — nur als Ausnahme, nicht flächendeckend.

## Schema (Kurzform)

`categories` · `people` · `locations` (visible: `main`/`side`/`source`) · `events {id, title, date, endDate, status, estimated?, timelineLane?, responsible, affectedRooms[], note}` · `assets {id, label, category, initialLocation, note, active}` · `moves {id, assetId, from, to, eventId, date, status: open|planned|ready|done|cancelled, actualDate, responsible, note}` · `audit[]`
