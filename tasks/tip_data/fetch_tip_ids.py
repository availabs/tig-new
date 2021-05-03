import os, psycopg2
from os import environ
import json

def get_tip_ids(cursor):
    print('FETCHING DATA...')
    sql = """
		SELECT tip_id,COUNT(id)
FROM public.tip_projects
	GROUP BY tip_id
	"""
    cursor.execute(sql)
    tip_ids_data = [{'name':t[0],'value':t[0]} for t in cursor.fetchall()]
    tip_ids_data.insert(0,{'name':'Select All','value':''})
    with open('tip_ids.json', 'w') as outfile:
        json.dump(tip_ids_data, outfile)
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

    get_tip_ids(cursor)


    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
