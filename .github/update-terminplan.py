import json
from pathlib import Path
from datetime import datetime, timezone

DATA_PATH = Path("data.json")
WORK_PATH = Path("ARBEITSSTAND.md")

data = json.loads(DATA_PATH.read_text(encoding="utf-8"))


def by_id(collection, item_id):
    for item in collection:
        if item.get("id") == item_id:
            return item
    raise KeyError(item_id)


def update(collection, item_id, **changes):
    item = by_id(collection, item_id)
    for key, value in changes.items():
        if value is _REMOVE:
            item.pop(key, None)
        else:
            item[key] = value
    return item


def upsert(collection, item):
    for idx, existing in enumerate(collection):
        if existing.get("id") == item["id"]:
            collection[idx] = item
            return
    collection.append(item)


_REMOVE = object()

# Raumhinweise auf den aktuellen abgestimmten Stand bringen.
location_updates = {
    "FI-U1": "Bis 10.09. komplett fertig und mit Beamer getestet; Einzug Sauter am 14.09.; vorerst ohne Clevertouch.",
    "FI-U2": "Bis 10.09. komplett fertig und mit Beamer getestet; Einzug Heilig am 14.09.; später Albrecht.",
    "FI-U3": "Bis 10.09. bestuhlt und weitgehend fertig; Clevertouch fehlt noch. Verkabelung laut aktuellem Terminplan am 22.09.",
    "FI-U4": "Bis 10.09. bestuhlt und weitgehend fertig; Clevertouch fehlt noch. Nutzungsbeginn offen.",
    "FI-U5": "12 Tische aus HR-4 ab 14./15.09.; Tischanschlüsse 15.–21.09.; endgültiger CT ab 26.10.",
    "FI-U6": "9 Tische aus HR-11 und Industrie 4.0 ab 14./15.09.; Tischanschlüsse 15.–21.09.; Nutzung durch Hoffmann ab 26.10.",
    "FI-U7": "Bis 14.09. komplett fertig und nutzbar; Prüfungsvorbereitung ab 15.09. mit Samsung Flip.",
    "FI-U8": "Umzug aus HR-3 am 21.09.; für Unterricht ab 23.09. vorgesehen. Einbauschränke vorhanden.",
    "FI-U9": "Teil der Umzugswelle 14./15.09.; Tischanschluss 15.–21.09. eventuell. Weitere Umzugsphase ab 26.10.",
    "FI-A1": "Büroumzug je nach Zeit am 14., 15. oder 21.09.; alle Büros bis 22.09. umzugsbereit.",
    "FI-A2": "Büroumzug je nach Zeit am 14., 15. oder 21.09.; alle Büros bis 22.09. umzugsbereit.",
}
for loc_id, text in location_updates.items():
    update(data["locations"], loc_id, use=text)

# Alte allgemeine Bau-Meilensteine werden durch den aktuellen Terminplan ersetzt.
update(data["events"], "ev_floor", status="cancelled", note="Durch den aktuellen abgestimmten Terminplan ersetzt.")
update(data["events"], "ev_spackle", status="cancelled", note="Durch den aktuellen abgestimmten Terminplan ersetzt.")

update(
    data["events"], "ev_early_rooms",
    title="FI-U1/U2 komplett; FI-U3/U4 bestuhlt und weitgehend fertig",
    date="2026-09-10", endDate="", status="planned", estimated=_REMOVE,
    affectedRooms=["FI-U1", "FI-U2", "FI-U3", "FI-U4"],
    note="Bis 10.09.: U1/U2 komplett mit Beamer und Test; U3/U4 bestuhlt und weitgehend fertig, Clevertouch fehlt noch."
)
update(
    data["events"], "ev_clean",
    title="Grundreinigung FI (Fa. Ripro)", date="2026-09-11", endDate="", status="planned",
    affectedRooms=[], note="Grundreinigung nach Abschluss der schmutzintensiven Bauarbeiten."
)
update(
    data["events"], "ev_move_sh",
    title="Einzug Sauter und Heilig in FI-U1/FI-U2", date="2026-09-14", endDate="", status="planned",
    estimated=_REMOVE, responsible="lautier-skanda",
    affectedRooms=["FI-U1", "FI-U2"], note="Bestätigter Einzugstermin 14.09.; FI-U1 vorerst ohne Clevertouch."
)
update(
    data["events"], "ev_offices",
    title="Umzug Büros A1 und A2", date="", endDate="", status="planned", estimated=_REMOVE,
    affectedRooms=["FI-A1", "FI-A2"],
    note="Tatsächlicher Büro-Umzug je nach Zeit am 14., 15. oder 21.09.; alle Büros bis 22.09. umzugsbereit."
)
update(
    data["events"], "ev_sep_wave",
    title="Harder-Umzugswelle HR-U4 / HR-U11 / HR-U13", date="2026-09-14", endDate="2026-09-15",
    status="planned", estimated=_REMOVE, responsible="spedition",
    affectedRooms=["FI-U5", "FI-U6", "FI-U9"],
    note="4 Mann + LKW; Umzug aus HR-U4, HR-U11 und HR-U13 nach F5/F6/F9. Konkreter F9-Inhalt noch offen."
)
update(
    data["events"], "ev_u7_ready",
    title="FI-U7 komplett fertig und nutzbar", date="2026-09-14", endDate="", status="planned",
    affectedRooms=["FI-U7"], note="Raum elektrisch angeschlossen und nutzbar."
)
update(
    data["events"], "ev_u7_start",
    title="Prüfungsvorbereitung startet in FI-U7", date="2026-09-15", endDate="", status="planned",
    affectedRooms=["FI-U7"],
    note="Anzeige/Tafel: Samsung Flip. Konkreter Gerätestandort derzeit ungeklärt."
)
update(
    data["events"], "ev_hr12_move",
    title="Clevertouch HR-12 nach FI-U3 – Termin neu klären", date="", endDate="", status="planned",
    estimated=_REMOVE,
    note="FI-U3 braucht weiterhin ein Display; bis 10.09. fehlt der Clevertouch. HR-12 ist laut Terminplan ab 21.09. nicht mehr verfügbar; Transport/Installation neu klären."
)
update(
    data["events"], "ev_u3_course",
    title="IEBT neu in FI-U3 – Starttermin neu klären", date="", endDate="", status="planned",
    estimated=_REMOVE,
    note="Bisheriger Start 21.09. ist nicht mehr belastbar; aktueller Terminplan sieht Verkabelung FI-U3 am 22.09. vor."
)
update(
    data["events"], "ev_owner_change",
    title="Heilig wechselt nach U3, Albrecht übernimmt U2 – Termin offen", date="", endDate="", status="planned",
    estimated=_REMOVE,
    note="Wechsel bleibt vorgesehen; Zeitpunkt neu klären, da FI-U3 laut Terminplan am 22.09. verkabelt wird."
)
update(
    data["events"], "ev_frank_move",
    title="Umzug Hr. Frank / CT-HR1 nach FI-U4 – Termin offen", date="", endDate="", status="planned",
    estimated=_REMOVE,
    note="Termin neu klären; HRS Raum 1 steht laut aktuellem Terminplan ab 21.09. nicht mehr zur Verfügung."
)
update(
    data["events"], "ev_late_wave",
    title="Umzugsphase ab 26.10. möglich", date="2026-10-26", endDate="", status="planned", estimated=True,
    responsible="spedition",
    note="Genaue Terminierung und Aufwand werden nach dem 21.09. erneut abgeschätzt; restliche Schränke und weiterer Aufbau F5/F6/F9."
)
update(
    data["events"], "ev_i4_move",
    title="Industrie 4.0 nach FI-U6", date="2026-09-14", endDate="2026-09-15", status="planned",
    estimated=_REMOVE, responsible="spedition", affectedRooms=["FI-U6"],
    note="Teil der Harder-Umzugswelle 14.–15.09.; Ziel FI-U6 bestätigt."
)
update(
    data["events"], "ev_u8_move",
    title="HR-3 wird nach FI-U8 umgezogen", date="2026-09-21", endDate="", status="planned",
    responsible="spedition", affectedRooms=["FI-U8"],
    note="Harder: 2 Mann + 3,5-t-Fahrzeug. HR-3 muss bis 20.09. umzugsfertig sein; FI-U8 soll ab 23.09. für Unterricht bereit sein."
)
update(
    data["events"], "ev_u8_elabo",
    note="Prüf-/Freigabetermin weiterhin offen; FI-U8 soll laut aktuellem Terminplan am 23.09. für Unterricht bereit sein."
)

new_events = [
    {"id":"ev_pulte_u7_u8","title":"Pulte für FI-U7 und FI-U8 nach FI bringen","date":"2026-09-04","endDate":"","status":"planned","responsible":"lautier-skanda","affectedRooms":["FI-U7","FI-U8"],"note":"Zwei leerstehende Seitentische aus HR-U4; werden in FI als Pult/Dozententisch verwendet."},
    {"id":"ev_it_install","title":"IT-Installation fertig (Terminplan)","date":"2026-09-09","endDate":"","status":"planned","responsible":"offen","affectedRooms":[],"note":"Im Terminplan wird zusätzlich nochmals der 14.09. mit 'IT Installation fertig' genannt; der unterschiedliche Umfang ist nicht beschrieben."},
    {"id":"ev_build_complete","title":"Trockenbau, Maler- und Elektroarbeiten abgeschlossen","date":"2026-09-10","endDate":"","status":"planned","responsible":"offen","affectedRooms":[],"note":"Kleine Restarbeiten dürfen später folgen; die schmutzintensiven Arbeiten sollen abgeschlossen sein."},
    {"id":"ev_sources_ready_sep","title":"HR-U4, HR-U11, HR-U13 und Industrie 4.0 umzugsbereit","date":"2026-09-11","endDate":"","status":"planned","responsible":"lautier-skanda","affectedRooms":[],"note":"Vorbereitung für die Harder-Umzugswelle 14.–15.09."},
    {"id":"ev_connections_5_6_9","title":"Tischanschlüsse FI-U5/FI-U6, ggf. FI-U9, inkl. Pult","date":"2026-09-15","endDate":"2026-09-21","status":"planned","responsible":"elektrofirma","affectedRooms":["FI-U5","FI-U6","FI-U9"],"note":"Anschluss der Tische und Pulte; FI-U9 nur soweit Umfang und Anzahl feststehen."},
    {"id":"ev_hr3_ready","title":"HR-3 umzugsfertig","date":"2026-09-20","endDate":"","status":"planned","responsible":"lautier-skanda","affectedRooms":[],"note":"Vorbereitung für den Umzug nach FI-U8 am 21.09."},
    {"id":"ev_hrs_1_12_closed","title":"HRS Räume 1 und 12 nicht mehr verfügbar","date":"2026-09-21","endDate":"","status":"planned","responsible":"offen","affectedRooms":[],"note":"Meilenstein am Quellstandort HRS."},
    {"id":"ev_offices_ready","title":"Alle Büros umzugsbereit","date":"2026-09-22","endDate":"","status":"planned","responsible":"offen","affectedRooms":["FI-A1","FI-A2"],"note":"Der tatsächliche Büro-Umzug kann je nach Zeit bereits am 14., 15. oder 21.09. stattfinden."},
    {"id":"ev_u3_wiring","title":"Verkabelung FI-U3","date":"2026-09-22","endDate":"","status":"planned","responsible":"elektrofirma","affectedRooms":["FI-U3"],"note":"Aktueller Terminplan."},
    {"id":"ev_hrs_17_18_closed","title":"HRS Räume 17 und 18 nicht mehr verfügbar","date":"2026-09-22","endDate":"","status":"planned","responsible":"offen","affectedRooms":[],"note":"Meilenstein am Quellstandort HRS."},
    {"id":"ev_u8_ready","title":"FI-U8 fertig für Unterricht","date":"2026-09-23","endDate":"","status":"planned","responsible":"lautier-skanda","affectedRooms":["FI-U8"],"note":"Zieltermin nach dem Umzug aus HR-3 am 21.09."},
    {"id":"ev_hrs_neubau_out","title":"HRS Neubau nicht mehr im Betrieb","date":"2026-09-26","endDate":"","status":"planned","responsible":"offen","affectedRooms":[],"note":"Betriebsende des Neubaus am Quellstandort."},
    {"id":"ev_stairwell_paint","title":"Treppenhaus streichen möglich","date":"2026-10-21","endDate":"","status":"planned","estimated":True,"responsible":"offen","affectedRooms":[],"note":"Ab 21.10. möglich; konkreter Termin noch festlegen."},
    {"id":"ev_late_connect","title":"Anschluss FI-U5/FI-U6/FI-U9 nach spätem Umzug","date":"","endDate":"","status":"planned","responsible":"elektrofirma","affectedRooms":["FI-U5","FI-U6","FI-U9"],"note":"Ab dem Folgetag des tatsächlichen Umzugs, frühestens 27.10.; richtet sich nach dem Umzugstermin."},
    {"id":"ev_hrs_altbau_empty","title":"HRS Altbau leer / nicht mehr im Betrieb","date":"2026-10-31","endDate":"","status":"planned","responsible":"offen","affectedRooms":[],"note":"Keller wird weiterhin für unkritische Lagerflächen benötigt; dort nichts Wertvolles lagern."}
]
for event in new_events:
    upsert(data["events"], event)

# Ausstattung: bestätigte Neuzuordnungen und offene Punkte.
update(data["assets"], "CT-HR13", label="Clevertouch HR-13 (defekt)", note="Defekt; FI-U1 bekommt vorerst keinen Clevertouch. Nicht nach FI-U1 einplanen.")
update(data["assets"], "MOEBEL-HR11-U5", label="9 Tische (3 × 3) und Stühle HR-11", note="Ziel FI-U6; Tische und Stühle von FI-U5/FI-U6 wurden neu verteilt.")
update(data["assets"], "MOEBEL-HR4-U6", label="12 Tische und Stühle HR-4", note="Ziel FI-U5; Tische und Stühle von FI-U5/FI-U6 wurden neu verteilt.")
update(data["assets"], "I4-HR13A", note="Ziel FI-U6; Umzug 14.–15.09. mit Harder.")
update(data["assets"], "DOZENT-HR4-2", label="Seitentisch HR-4 als Pult U7", note="Leerer Seitentisch aus HR-U4; wird als Pult/Dozententisch in FI-U7 verwendet.")
update(data["assets"], "DOZENT-HR4-3", label="Seitentisch HR-4 als Pult U8", note="Leerer Seitentisch aus HR-U4; wird als Pult/Dozententisch in FI-U8 verwendet.")
update(data["assets"], "CT-HR4", note="Bisherige Interimszuordnung über FI-U7/FI-U2 ist nicht mehr belastbar; aktuelle Zuordnung offen.")
update(data["assets"], "SCHRANK-U8", label="Zusätzliche Schränke U8 (Umfang offen)", note="FI-U8 hat Einbauschränke; zusätzliche Schränke aus HR-3 werden eventuell nur teilweise benötigt.")
upsert(data["assets"], {"id":"EINBAUSCHRAENKE-U8","label":"Einbauschränke FI-U8","category":"cabinet","initialLocation":"FI-U8","note":"Bereits vorhanden; reduziert voraussichtlich den Bedarf an zusätzlichen Schränken aus HR-3.","active":True})

# Bewegungen an die neue Zuordnung hängen.
update(data["moves"], "mv-ct13-u1", status="cancelled", note="Gerät defekt; FI-U1 bekommt vorerst keinen Clevertouch.")
update(data["moves"], "mv-moebel11-u5", to="FI-U6", eventId="ev_sep_wave", date="", status="planned", responsible="spedition", note="9 Tische (3 × 3) und Stühle nach FI-U6.")
update(data["moves"], "mv-moebel4-u6", to="FI-U5", eventId="ev_sep_wave", date="", status="planned", responsible="spedition", note="12 Tische und Stühle nach FI-U5.")
update(data["moves"], "mv-i4-u5", to="FI-U6", eventId="ev_i4_move", date="", status="planned", responsible="spedition", note="Industrie 4.0 nach FI-U6; Umzug 14.–15.09.")
update(data["moves"], "mv-dozent4-2-u7", eventId="ev_pulte_u7_u8", date="", status="planned", responsible="lautier-skanda", note="Seitentisch aus HR-U4 als Pult; Transport bis 04.09.")
update(data["moves"], "mv-dozent4-3-u8", eventId="ev_pulte_u7_u8", date="", status="planned", responsible="lautier-skanda", note="Seitentisch aus HR-U4 als Pult; Transport bis 04.09.")
update(data["moves"], "mv-ct4-u7", status="cancelled", note="Bisherige Interimsplanung für FI-U7 überholt; für die Prüfungsvorbereitung ist ein Samsung Flip vorgesehen. Aktuelle Zuordnung des CT-HR4 offen.")
update(data["moves"], "mv-ct4-u2", status="cancelled", note="Folgebewegung der überholten Interimsplanung FI-U7 → FI-U2; aktuelle Zuordnung des CT-HR4 offen.")

# Konsistenzprüfungen vor dem Schreiben.
locations = {x["id"] for x in data["locations"]}
assets = {x["id"] for x in data["assets"]}
events = {x["id"] for x in data["events"]}
assert len(locations) == len(data["locations"])
assert len(assets) == len(data["assets"])
assert len(events) == len(data["events"])
assert len({x["id"] for x in data["moves"]}) == len(data["moves"])
for move in data["moves"]:
    assert move["assetId"] in assets, move["id"]
    assert move["from"] in locations and move["to"] in locations, move["id"]
    assert not (move.get("eventId") and move.get("date")), move["id"]
    if move.get("eventId"):
        assert move["eventId"] in events, move["id"]

now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
data["updatedAt"] = now
data["actor"] = "Sauter"
data.setdefault("audit", []).insert(0, {
    "at": now,
    "actor": "Sauter",
    "text": "Aktuellen Terminplan eingearbeitet: Räume 1–4 bis 10.09., Grundreinigung 11.09., Einzug Sauter/Heilig 14.09.; Harder-Welle 14.–15.09.; Tische F5/F6 neu verteilt (12 nach F5, 9 nach F6), Industrie 4.0 nach F6; Pulte aus HR-U4 für F7/F8 bis 04.09.; F8-Umzug 21.09. und Unterricht ab 23.09.; Büro-Umzug flexibel; späte Welle ab 26.10. F1-CT wegen Defekt gestrichen, CT-HR4-Zuordnung offen, Einbauschränke F8 ergänzt; unklare F3-/CT-Termine auf offen gesetzt."
})

DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

stand = WORK_PATH.read_text(encoding="utf-8")
section = """**03.09.2026**\n\n- Sicherheitsstand vor der Terminplan-Aktualisierung als Branch `backup-2026-09-03-vor-terminupdate` gesichert (Stand `0708272`).\n- Aktuellen abgestimmten Terminplan für FI/HRS eingearbeitet: Räume 1–4, Grundreinigung, Umzugswelle 14.–15.09., F7, F8, Büros und späte Umzugsphase ab 26.10.\n- FI-U5/FI-U6 korrigiert: 12 Tische aus HR-U4 nach F5, 9 Tische aus HR-U11 nach F6; Industrie 4.0 nach F6. Dozententische und Clevertouch-Zuordnung F5/F6 bleiben wie geplant.\n- Zwei Seitentische aus HR-U4 als Pulte für FI-U7 und FI-U8 bis 04.09. eingeplant.\n- FI-U1 vorerst ohne Clevertouch, da das vorgesehene Gerät aus HR-13 defekt ist. Bisherige CT-HR4-Interimsbewegungen storniert; aktuelle Zuordnung offen.\n- FI-U8: vorhandene Einbauschränke ergänzt; zusätzlicher Schrankumfang aus HR-3 bleibt offen.\n- Widersprüchliche bzw. nicht mehr belastbare Termine für FI-U3, CT-HR12 und den späteren Wechsel Heilig/Albrecht auf offen gesetzt.\n\n"""
anchor = "## Letzter Stand\n\n"
if "**03.09.2026**" not in stand:
    if anchor not in stand:
        raise RuntimeError("ARBEITSSTAND-Anker nicht gefunden")
    stand = stand.replace(anchor, anchor + section, 1)
WORK_PATH.write_text(stand, encoding="utf-8")
