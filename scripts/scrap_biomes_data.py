from bs4 import BeautifulSoup
from urllib.parse import urlsplit, urlunsplit
import re
import json
from queue import Queue
from threading import Lock
import requests
import time
from pathlib import Path

class UniqueQueue:
    def __init__(self):
        self.q = Queue()
        self.seen = set()
        self.lock = Lock()  # ensures atomicity for set + queue ops

    def put(self, item):
        with self.lock:
            if item.get('link') not in self.seen:
                self.seen.add(item.get('link'))
                self.q.put(item)

    def get(self):
        return self.q.get()

    def empty(self):
        return self.q.empty()

base_url = "https://deadcells.wiki.gg"
queue = UniqueQueue()
queue.put({ 
    "name": "Prisoners' Quarters",
    "link": "/wiki/Prisoners%27_Quarters" 
    })
biomes = []
blacklist = ["Giant"]

while not queue.empty():
    wait_required = True
    q_data = queue.get()
    url = q_data.get('link')
    name = q_data.get('name')
    tag = q_data.get('tag')
    try:
        path = Path(f"scripts/_scrap/{name}.html")
        if path.exists():
            html = path.read_text(encoding="utf-8")
            wait_required = False
        else:
            r = requests.get(f'{base_url}{url}')
            r.raise_for_status()
            html = r.text
            path.write_text(html, encoding="utf-8")

        soup = BeautifulSoup(html, "html.parser")
        a = soup.select_one("aside.portable-infobox")
        if a:
            biome = { 
                "name": a.find('h2').get_text(),
                "description": [item.get_text().strip() for item in soup.find_all("div", class_="hslider__item")],
                "wiki": f'{base_url}{url}',
                "image": f'https://deadcells.wiki.gg/images/{soup.find("img", class_="pi-image-thumbnail")["src"].split("-", 1)[-1]}',
                "entrances": {
                    int(re.search(r'\d+', div['data-source']).group()): [entrance.get_text(strip=True) for entrance in div.find_all('a') if entrance.get_text(strip=True) not in blacklist]
                    for div in a.find_all('div', attrs={'data-source': re.compile(r'^entrance_\d+$')})
                },
                "exits": {
                    int(re.search(r'\d+', div['data-source']).group()): [entrance.get_text(strip=True) for entrance in div.find_all('a') if entrance.get_text(strip=True) not in blacklist]
                    for div in a.find_all('div', attrs={'data-source': re.compile(r'^exit_\d+$')})
                },
                "scrolls": {
                    int(re.search(r'\d+', div['data-source']).group()): [{"amount": int(x.strip().split(maxsplit=1)[0]), "type": x.strip().split(maxsplit=1)[1]} for x in ' '.join(div.find('div').get_text().split()).split(',')]
                    for div in a.find_all('div', attrs={'data-source': re.compile(r'^scrolls_\d+$')})
                },
                "elite": {},
                "doors": {
                    int(re.search(r'\d+', div['data-source']).group()): [x.strip() for x in ' '.join(div.get_text().split()).split(',')]
                    for div in a.find_all('div', attrs={'data-source': re.compile(r'^BSC_door_\d+$')})
                },
                "scroll_fragments": {
                    int(re.search(r'\d+', div['data-source']).group()): div.find('div').get_text()
                    for div in a.find_all('div', attrs={'data-source': re.compile(r'^scroll_frags_\d+$')})
                },
                "cursed_chests": {
                    int(re.search(r'\d+', div['data-source']).group()): float(div.find('div').contents[0].strip('%'))/100
                    for div in a.find_all('div', attrs={'data-source': re.compile(r'^cursed_chests_\d+$')})
                }
            }

            if tag:
                biome['dlc'] = tag

            timed_door = a.find('div', attrs = {'data-source': 'timed_door'})
            if(timed_door):
                time_required = timed_door.find('div').contents[0].split(' ', 1)[0]
                parts = list(map(int, time_required.split(':')))
                if len(parts) < 2:
                    parts.append(0)
                biome["timed_door"] = parts[0]*60 + parts[1]


            wandering_elites = a.find('div', attrs = {'data-source': 'wandering_elite'})
            if(wandering_elites):
                biome["elite"]["wandering"] = float(wandering_elites.find('div').contents[0].strip('%'))/100
                
            elite_room = a.find('div', attrs = {'data-source': 'elite_room'})
            if(elite_room):
                biome["elite"]["obelisk"] = float(elite_room.find('div').contents[0].strip('%'))/100
            
            biomes.append(biome)

            for exit in (a.find('div', attrs = {'data-source': 'exit_4'}).find_all('a') if a.find('div', attrs={'data-source': 'exit_4'}) else []):
                if exit.get_text(strip=True) not in blacklist:
                    queue.put({
                        "name": exit.get_text(strip=True),
                        "link": exit['href'],
                        "tag": exit.find_next_sibling().get_text(strip=True) if exit.find_next_sibling() and exit.find_next_sibling().name == 'sup' else None
                    })

            print(f"{name}: DONE {json.dumps(biome, indent=2)}\n\n")
        else:
            print(f"{name}: no infobox found\n\n")
    except Exception as e:
        print(f"{name}: ERROR {e}\n\n")
    finally:
        if wait_required and not queue.empty():
            time.sleep(10)
if biomes:
    with open('scripts/_biomes.json', 'x') as fp:
        json.dump(biomes, fp)
