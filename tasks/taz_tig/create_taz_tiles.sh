rm -rf *.ndjson *.mbtiles
python createTazJson.py
tippecanoe -zg --generate-ids -o nmytc_taz_2020.mbtiles --coalesce-densest-as-needed --extend-zooms-if-still-dropping nymtc_taz_2020.ndjson