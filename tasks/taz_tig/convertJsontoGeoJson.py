import json
data = json.load(open('taz.json'))
geojson = {
    "type":"FeatureCollection",
    "features":[
        {
            "type": "Feature",
            "geometry":{
                "type":"Multipolygon",
                "coordinates":[d["lon"], d["lat"]]
            },
            "properties":d,
        } for d in data]
}

output = open('taz.geojson','w')
json.dump(geojson,output)

print(geojson)
