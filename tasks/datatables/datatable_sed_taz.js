const db = require('./db.js');
var sql = require('sql');

sql.setDialect('postgres');


const fetch = async () => {
    // change sources below, and server in db.js
    const schema ='sed_taz'
    const getSourcesSql = `select id from public.sources where type = 'sed_taz'`
    let {rows: sources } = await db.query(getSourcesSql);
    return sources
        //.filter(s => s.id === 5)
        .reduce(async (acc, s) => acc.then(async () => {
        let tablename = `sed_taz_source_${s.id}`
        const sql = `
            with s as (
                SELECT
                    areas.name,
                    areas.id,
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
                group by areas.name, areas.id,df.view_id
            ),
            t as (
             select name, 
                s.id, 
                jsonb_agg(
                    json_build_object(view_id, values)
                ) as value 
            from s
                group by name, s.id
            )

            

            SELECT name, t.id,  value, enclosing_name, enclosing_type, geom 
            into ${schema}.${tablename}
            from t
            JOIN base_geometries geoms
                ON geoms.id = t.id
            JOIN (
                SELECT name enclosing_name, type enclosing_type, enclosed_area_id
                
                FROM public.area_enclosures
                JOIN areas
                    ON areas.id = enclosing_area_id
            ) enclosing_geoms
            ON enclosed_area_id = t.id
            
            
        `

        let res = await db.query(sql);
        res = res.rows || [];

        //console.log(res[0].value)

        // let tableName = 'datatable_' + s.toLowerCase().split(' ').join('_');
        // console.log('creating table', tableName)
        // let createSql = `
        //     CREATE TABLE IF NOT EXISTS ${schema}.${tableName}
        //     (
        //         ${res.map(r => `"${r.view_id}" json`).join(', ')}
        //     )
        // `;
        // console.log('create table', createSql);
        // await db.query(createSql);

        // let insertSql = (viewId, data) => `
        //     INSERT INTO ${schema}.${tableName}("${viewId}")
        //     VALUES (${`'${JSON.stringify(data)}'::json`})
        // `;

        // let updateSql = (viewId, data) => `
        //     UPDATE ${schema}.${tableName}
        //     SET "${viewId}" = ${`'${JSON.stringify(data)}'::json`}
        // `;

        // return res.reduce((acc, r, i) => {
        //     return acc.then(() => {
        //         if (i === 0) {
        //             return db.query(insertSql(r.view_id, r.data))
        //         } else {
        //             return db.query(updateSql(r.view_id, r.data))
        //         }
        //     })
        // }, Promise.resolve())
    }), Promise.resolve())
}

fetch()