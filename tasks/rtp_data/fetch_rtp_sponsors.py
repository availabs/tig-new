import os, psycopg2
from os import environ
import json

def get_rtp_sponsors(cursor):
    print('FETCHING DATA...')
    sql = """
		SELECT id, name
	FROM public.sponsors;
	"""
    cursor.execute(sql)
    rtp_sponsors_data = [{'value':t[0],'name':t[1]} for t in cursor.fetchall()]
    with open('rtp_sponsors.json', 'w') as outfile:
        json.dump(rtp_sponsors_data, outfile)
    print('FETCHED DATA AND JSON CREATED')
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

    get_rtp_sponsors(cursor)


    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
