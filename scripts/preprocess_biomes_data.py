import json
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional
import re

@dataclass
class Scroll:
    power: int = 0
    dual: int = 0
    fragment: int = 0
    cursed: float = 0.0

@dataclass
class Elite:
    obelisk: float = 0.0
    wandering: float = 0.0

@dataclass
class Biome:
    name: str
    wiki: str
    image: str
    dlc: str
    type: str
    level: float
    is_spoiler: bool
    entrances: Dict[int, List[str]] = field(default_factory=dict)
    exits: Dict[int, List[str]] = field(default_factory=dict)
    scrolls: Dict[int, Scroll] = field(default_factory=dict)
    elites: Elite = field(default_factory=Elite)
    doors: Dict[int, List[str]] = field(default_factory=dict)
    timed_door: Optional[int] = None

@dataclass
class Biomes:
    wiki_base: str
    biomes: List[Biome] = field(default_factory=list)

scroll_adapter = lambda scrolls, fragments, cursed_chests: Scroll(
    power = next((item["amount"] for item in scrolls if item["type"] == "Scrolls of Power"), 0),
    dual = next((item["amount"] for item in scrolls if item["type"] == "Dual Scrolls"), 0),
    fragment = fragments,
    cursed = cursed_chests
)

def sanitize_door(door):
    if door.strip()[:4].lower() == 'exit':
        return f'exit: {re.split('to|the', door, flags=re.IGNORECASE)[-1].strip()}'
    elif door.strip()[-4:].lower() == 'exit':
        return f'exit: {door[:-5]}'
    elif door.strip()[-3:].lower() == 'vat':
        res = 'Cell Vat'
    elif door.strip()[-5:].lower() == 'altar':
        res = 'Chained Items'
    else:
        res = door
    
    return res.title()

with open("scripts/_biomes.json", "r") as f:
    biomes_src = json.load(f)

with open("scripts/_hierarchy.json", "r") as f:
    biomes_hierarchy = json.load(f)

castle_generic_name = "Dracula's Castle"
castle_early_name = "Dracula's Castle (early)"
castle_late_name = "Dracula's Castle (late)"
biomes = Biomes(wiki_base = "https://deadcells.wiki.gg")
for biome_src in biomes_src:
    if biome_src.get('name') == castle_generic_name:
        hierarchy_early = biomes_hierarchy.get(castle_early_name)
        hierarchy_late = biomes_hierarchy.get(castle_late_name)
        depth3 = Biome(
            name = castle_early_name,
            wiki = biome_src.get('wiki'),
            image = biome_src.get('image'),
            dlc = biome_src.get('dlc'),
            type = hierarchy_early.get('type'),
            level = hierarchy_early.get('level'),
            is_spoiler = hierarchy_early.get('spoiler')
        )
        depth6 = Biome(
            name = castle_late_name,
            wiki = biome_src.get('wiki'),
            image = biome_src.get('image'),
            dlc = biome_src.get('dlc'),
            type = hierarchy_late.get('type'),
            level = hierarchy_late.get('level'),
            is_spoiler = hierarchy_late.get('spoiler')
        )

        for bc in range(5):
            entrances = biome_src.get('entrances').get(str(bc), [])
            depth3.entrances[bc] = entrances[:3]
            depth6.entrances[bc] = entrances[3:]


            exits = biome_src.get('exits').get(str(bc), [])
            depth3.exits[bc] = exits[:2]
            depth6.exits[bc] = exits[2:]

            scrolls = biome_src.get('scrolls').get(str(bc), [])
            fragments = biome_src.get('scroll_fragments').get(str(bc))
            cursed_chests = biome_src.get('cursed_chests').get(str(bc), 0.0)
            depth3.scrolls[bc] = scroll_adapter(scrolls[:2], int(fragments.split(',')[0].split()[0]) if fragments else 0, cursed_chests)
            depth6.scrolls[bc] = scroll_adapter(scrolls[3:5], int(fragments.split(',')[1].split()[0]) if fragments else 0, cursed_chests)

            doors = list(map(sanitize_door, biome_src.get('doors').get(str(bc), [])))
            depth3.doors[bc] = doors
            depth6.doors[bc] = doors
        
        depth6.scrolls[1] = depth3.scrolls[1]

        depth3.elites = depth6.elites = Elite(
            obelisk = biome_src.get('elite').get('obelisk', 0), 
            wandering = biome_src.get('elite').get('wandering', 0)
        )

        depth3.timed_door = depth6.timed_door = biome_src.get('timed_door')

        biomes.biomes.append(depth3)
        biomes.biomes.append(depth6)
    
    else:
        name = biome_src.get('name')
        hierarchy = biomes_hierarchy.get(name)
        biome = Biome(
            name = name,
            wiki = biome_src.get('wiki'),
            image = biome_src.get('image'),
            dlc = biome_src.get('dlc'),
            type = hierarchy.get('type'),
            level = hierarchy.get('level'),
            is_spoiler = hierarchy.get('spoiler')
        )

        for bc in range(5):
            biome.entrances[bc] = biome_src.get('entrances').get(str(bc), [])
            biome.exits[bc] = biome_src.get('exits').get(str(bc), [])

            scrolls = biome_src.get('scrolls').get(str(bc), [])
            fragments = biome_src.get('scroll_fragments').get(str(bc), 0)
            cursed_chests = biome_src.get('cursed_chests').get(str(bc), 0.0)
            biome.scrolls[bc] = scroll_adapter(scrolls, int(fragments), float(cursed_chests))

            biome.doors[bc] = list(map(sanitize_door, biome_src.get('doors').get(str(bc), [])))
        
        biome.elites = Elite(
            obelisk = biome_src.get('elite').get('obelisk', 0), 
            wandering = biome_src.get('elite').get('wandering', 0)
        )

        biome.timed_door = biome_src.get('timed_door')

        biomes.biomes.append(biome)

for castle_name in [castle_early_name, castle_late_name]:
    castle = next(biome for biome in biomes.biomes if biome.name == castle_name)
    for bc in range(5):
        for entrance_name in castle.entrances[bc]:
            entrance = next(biome for biome in biomes.biomes if biome.name == entrance_name)
            for key, values in entrance.exits.items():
                entrance.exits[key] = [castle_name if v == castle_generic_name else v for v in values]
        for exit_name in castle.exits[bc]:
            exit = next(biome for biome in biomes.biomes if biome.name == exit_name)
            for key, values in exit.entrances.items():
                exit.entrances[key] = [castle_name if v == castle_generic_name else v for v in values]

with open('public/biomes.json', 'x') as f:
    json.dump(asdict(biomes), f)