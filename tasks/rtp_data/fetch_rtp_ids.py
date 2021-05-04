import os, psycopg2
from os import environ
import json

def get_rtp_ids(cursor):
    print('FETCHING DATA...')
    sql = """
		SELECT rtp_id,count(id)
	FROM public.rtp_projects
	GROUP BY rtp_id 
	"""
    cursor.execute(sql)
    rtp_ids_data = [{'name':t[0],'value':t[0]} for t in cursor.fetchall()]
    rtp_ids_data.insert(0,{'name':'Select All','value':''})
    with open('rtp_ids.json', 'w') as outfile:
        json.dump(rtp_ids_data, outfile)
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

    get_rtp_ids(cursor)


    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
