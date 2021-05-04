import os, psycopg2
from os import environ
import json

def get_tip_mpos(cursor):
    print('FETCHING DATA...')
    sql = """
		SELECT id, name
	FROM public.mpos;
	"""
    cursor.execute(sql)
    tip_mpos_data = [{'name':t[1],'value':t[0]} for t in cursor.fetchall()]
    tip_mpos_data.insert(0,{'name':'Select All','value':''})
    with open('tip_mpos.json', 'w') as outfile:
        json.dump(tip_mpos_data, outfile)
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

    get_tip_mpos(cursor)


    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()
