import os, psycopg2
from os import environ
import json
import yaml


def countiesData():
    data = []
    with open('../counties_tig/counties.json') as f:
        result = json.load(f)
        for item in result:
            data.append(item)

    return data


def fetchTazData(cursor, item):
    print('IN FETCH TAZ DATA', item)
    taz_table = "public." + "tl_2011_" + item["fips"] + "_taz10"

    sql = """
    SELECT name, d.geoid10 as taz_geoid,
    c.geoid as county_geoid,
    St_AsGeoJSON(st_makevalid(b.geom)) as base_geom
    FROM public.areas as a
    join public.base_geometries as b on a.base_geometry_id = b.id
    join public.us_county as c on ST_CONTAINS(c.the_geom,b.geom)
    JOIN """ + taz_table + """ as d on ST_intersects(st_makevalid(d.geom),st_makevalid(b.geom))
    where a.type = 'taz' and a.year = '2005' and c.geoid::INTEGER = """ + item["geoid"] + """
    and
    (st_area(st_intersection(st_makevalid(d.geom),st_makevalid(b.geom)))/st_area(b.geom)) > .51
    """

    cursor.execute(sql)
    data = [{"taz_id": t[0], "taz_geoid": t[1], "county_geoid": t[2], "county_name": item["name"],
             "state_code": item["state_code"], "fips": item["fips"], "geometry": t[3].replace("\"", "")} for t in
            cursor.fetchall()]
    print('length of data fetched', item['name'], '->>', len(data))
    if len(data) > 0:
        if not os.path.isfile('taz.json'):
            with open('taz.json', mode='w') as f:
                f.write(json.dumps(data, indent=2))
        else:
            with open('taz.json') as existing_data:
                feeds = json.load(existing_data)
                for d in data:
                    if d not in feeds:
                        feeds.append(d)
            with open('taz.json', mode='w') as f:
                f.write(json.dumps(feeds, indent=2))
    else:
        return


def geo_convert():
    with open('taz.json') as existing_data:
        feeds = json.load(existing_data)
    feat_coll = {'type': 'FeatureCollection',
                 'features': []}

    for feed in feeds:
        feat_coll['features'].append(
            {'type': 'Feature',
             'geometry': {
                 'type': 'Polygon',
                 'coordinates': yaml.load(feed['geometry'],Loader=yaml.FullLoader)['coordinates']
             }})

    with open('taz.geojson', mode='w') as f:
        f.write(json.dumps(feat_coll, indent=2))


def main():
    with open('../../config/nymtc.env') as f:
        os.environ.update(
            line.replace('export ', '', 1).strip().split('=', 1) for line in f
            if 'export' in line
        )

    conn = psycopg2.connect(host=environ.get('PGHOST'),
                            database=environ.get('PGDATABASE'),
                            user=environ.get('PGUSER'),
                            port=environ.get('PGPORT'),
                            password=environ.get('PGPASSWORD'))
    cursor = conn.cursor()

    data = countiesData()
    for item in data:
        fetchTazData(cursor, item)

    geo_convert()

    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
