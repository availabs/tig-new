Steps to map the taz in the nymtc development database:

1) Downloaded the Taz tiger line shape file from census api for the year 2005
2) uploaded it in the database and did a foreign data wrapper connection with hazard mitigation

CREATE EXTENSION postgres_fdw;
CREATE SERVER foreign_server
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host 'lor.availabs.org', port '5432', dbname 'geocensus');
CREATE USER MAPPING FOR postgres
        SERVER foreign_server
        OPTIONS (user 'postgres', password 'transit');
CREATE FOREIGN TABLE us_county (
        geoid varchar(5) NOT NULL,
       	the_geom geometry
)
        SERVER foreign_server
        OPTIONS (schema_name 'public', table_name 'tl_2013_us_county');

3) Ran a query with joins on first the county table and then the TAZ table to populate the fips in the area table of nymtc development with taz geoid
the area table in nymtc development is related to the base geometries table

SELECT a.id, name, type, year, b.geom as base_geometry_geom,
c.geoid as county_geoid,d.geoid10 as taz_geoid
    FROM public.areas as a
    join public.base_geometries as b on a.base_geometry_id = b.id
    join public.us_county as c on ST_CONTAINS(c.the_geom,b.geom)
    JOIN public.tl_2011_36_taz as d on ST_intersects(d.geom,b.geom)
    where a.type = 'taz' and a.year = '2012' and c.geoid = '36059'
    and
    (st_area(st_intersection(d.geom,b.geom))/st_area(b.geom)) > .9

4) The name in the area table match with the taz id on the nymtc map only if we filter on the year as 2005

5) Convert taz 36,34,09 fips shape files to geojson

ogr2ogr -f GeoJSON /home/nayanika/Downloads/ny_taz.geojson /home/nayanika/Downloads/tl_2011_36_taz10.shp

6) Convert shapefiles of taz 2010 to mbtiles and upload on mapbox

tippecanoe -zg --generate-ids -o taz_ny_nj_ct.mbtiles --coalesce-densest-as-needed --extend-zooms-if-still-dropping ny_taz.geojson nj_taz.geojson ct_taz.geojson

