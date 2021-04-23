import requests
import json

URL = 'https://tig.nymtc.org/data/hub_bound.geojson'

r = requests.get(url = URL)

data = r.json()

with open('hub_bound.geojson', 'w') as outfile:
    json.dump(data, outfile)
