import os, psycopg2
from os import environ
import json

def get_census_tracts(cursor):
    print('FETCHING DATA...')
    sql = """
		SELECT name,fips_code
    FROM public.areas as a
    where type = 'census_tract'
    and fips_code is not null

	"""
    cursor.execute(sql)

    fips_data = [{
        'geoid': ('0' + str(t[1]) if str(t[1])[0:2] == '90' else str(t[1])),
        'name':t[0],
        'fips': (str(t[1])[0:2] if str(t[1])[0:2] != '90' else '09'),
        'state_code': ('NY' if str(t[1])[0:2] == '36' else 'NJ' if str(t[1])[0:2] == '34' else 'CT')
    }
    for t in cursor.fetchall()]
    with open('tracts.json', 'w') as outfile:
        out = json.dumps(fips_data,indent=2)
        outfile.write(out)
    print('FETCHED DATA AND JSON CREATED')
    #return fips_data

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

    get_census_tracts(cursor)


    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
