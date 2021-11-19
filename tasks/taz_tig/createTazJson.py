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


def fetchTazData(cursor):
    sql = """
    SELECT row_to_json(f) As feature
        FROM (
            SELECT 'Feature' As type,
                    ST_AsGeoJSON(b.geom)::json As geometry,
                    row_to_json(
                        (SELECT l FROM (SELECT a.id AS id, a.name as name, a.type as type, a.year as year) As l)
                    ) As properties
            FROM public.areas as a
            join public.base_geometries as b on a.base_geometry_id = b.id
            where a.type = 'taz' and a.year = '2020'
     ) As f
    """

    cursor.execute(sql)
    data = cursor.fetchall()
    print('length of data fetched ->>', len(data))
    if len(data) > 0:
        if not os.path.isfile('nymtc_taz_2020.ndjson'):
            with open('nymtc_taz_2020.ndjson', mode='w') as f:
                for d in data:
                    f.write(json.dumps(d[0]))
                    f.write('\n')
                       
        else:
            with open('nymtc_taz_2020.ndjson', mode='w') as f:
                for d in data:
                    f.write(json.dumps(d[0]))
                    f.write('\n')
    else:
        return


def geo_convert():
    data = json.load(open('taz_2020.json'))
    geojson = {
        "type":"FeatureCollection",
        "features":[
            {
                "type": "Feature",
                "properties": { "id":d["id"], "name": d["name"], "type": d["type"], "year": d["year"] },
                'geometry': {
                 'type': 'Polygon',
                 'coordinates': yaml.load(d['geometry'],Loader=yaml.FullLoader)['coordinates']
             }
            } for d in data]
    }

    output = open('taz_2020.geojson','w')
    json.dump(geojson,output)


def main():
    with open('../nymtc.env') as f:
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

    fetchTazData(cursor)

    # geo_convert()

    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
