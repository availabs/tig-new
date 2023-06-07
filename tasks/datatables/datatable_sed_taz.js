const db = require('./db.js');
var sql = require('sql');

sql.setDialect('postgres');


const fetch = async () => {
    // change sources below, and server in db.js
    const schema ='sed_taz'
    const getSourcesSql = `select id from public.sources where datasource_type = 'sed_taz'`
    let {rows: sources } = await db.query(getSourcesSql);
    return sources
        //.filter(s => s.id === 5)
        .reduce(async (acc, s) => acc.then(async () => {
        let tablename = `sed_taz_source_${s.id}`
        const sql = `
            drop table if exists ${schema}.${tablename};
            with s as (
                SELECT
                    areas.name,
                    df.area_id,
                    view_id,
                    jsonb_agg(
                        json_build_object( df.year, value)
                    ) as values
                FROM   public.demographic_facts df
                JOIN public.areas areas                 
                    ON area_id = areas.id
                WHERE view_id IN (
                    SELECT v.id
                    FROM public.views v
                    JOIN sources s
                    ON v.source_id = s.id
                    where s.id = ${s.id}
                  and deleted_at is null
                )
                group by areas.name, df.area_id,df.view_id
            ),
            t as (
             select name, 
                s.area_id, 
                jsonb_agg(
                    json_build_object(view_id, values)
                ) as value 
            from s
                group by name, s.area_id
            )

            

            SELECT areas.name, t.area_id,  value, enclosing_name, enclosing_type, geom 
            into ${schema}.${tablename}
            from t
            JOIN public.areas areas
                ON t.area_id = areas.id
            JOIN base_geometries geoms
                ON geoms.id = base_geometry_id
            JOIN (
                SELECT name enclosing_name, type enclosing_type, enclosed_area_id
                FROM public.area_enclosures
                JOIN areas
                    ON areas.id = enclosing_area_id
            ) enclosing_geoms
            ON enclosed_area_id = t.area_id
            
            
        `

        let res = await db.query(sql);
        res = res.rows || [];

        
    }), Promise.resolve())
}

fetch()