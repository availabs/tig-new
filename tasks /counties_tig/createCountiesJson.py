import os, psycopg2
from os import environ
import json

def get_state_fips_code(cursor):
    print('FETCHING DATA...')
    sql = """
		SELECT statefp,geoid, name,
	(CASE 
		WHEN statefp = '36' THEN 'NY'
		WHEN statefp = '34' THEN 'NJ'
		WHEN statefp = '09' THEN 'CT'
 	END) as state_code
	FROM geo.tl_2017_us_county
	WHERE (statefp = '36' or statefp = '34' or statefp = '09')
	"""
    cursor.execute(sql)

    fips_data = [{'fips': t[0],'geoid': t[1],'name':t[2],'state_code': t[3]} for t in cursor.fetchall()]
    with open('counties.json', 'w') as outfile:
        json.dump(fips_data, outfile)
    print('FETCHED DATA AND JSON CREATED')
    #return fips_data

def main():
    with open('../../config/postgres.env') as f:
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

    get_state_fips_code(cursor)


    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
