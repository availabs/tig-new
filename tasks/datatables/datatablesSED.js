const db = require('./db.js');
var sql = require('sql');

sql.setDialect('postgres');


const fetch = async () => {
    // change sources below, and server in db.js
    let allSrc = {
        local: [
            // '2040 SED County Level Forecast Data',
            // '2050 SED County Level Forecast Data',

            '2040 SED TAZ Level Forecast Data',
            // '2050 SED TAZ Level Forecast Data', -- no data
            '2055 SED TAZ Level Forecast Data'
        ],
        tigtet2: [
            // "2040 SED County Level Forecast Data",
            "2040 SED TAZ Level Forecast Data",
            "2050 SED County Level Forecast Data",
            "2050 SED TAZ Level Forecast Data",
            "2055 SED COUNTY LEVEL DATA",
            "2055 SED TAZ LEVEL FORECAST"
        ]
    }
    let sources = allSrc.tigtet2;

    return sources.reduce(async (acc, s) => acc.then(async () => {
        console.log('source', s);
        const schema = s.includes('TAZ') ? 'sed_taz' : 'sed_county';

        const sql = `
            with s as (SELECT view_id,
                              df.year,
                              array_agg(json_build_object('value', value, 'area', areas.name, 'type', areas.type,
                                                          'geom', st_asgeojson(geoms.geom)
                                                              ${s.includes('TAZ') ? `, 'enclosing_name', enclosing_name, 'enclosing_type', enclosing_type` : ``}
                                  )) AS data
                       FROM public.demographic_facts df

                                JOIN public.areas areas
                                     ON area_id = areas.id
                                JOIN base_geometries geoms
                                     ON geoms.id = base_geometry_id
                ${
                        s.includes('TAZ') ?
                                `    JOIN (
                                            SELECT name enclosing_name, type enclosing_type, enclosed_area_id
                                            FROM public.area_enclosures
                                                     join areas
                                                          on areas.id = enclosing_area_id
                                        ) enclosing_geoms
                                     ON enclosed_area_id = area_id` : ``
                }


            WHERE view_id IN (
                SELECT v.id
                FROM public.views v
                JOIN sources s
                ON v.source_id = s.id
                where s.name = '${s}'
              and deleted_at is null
                )
            group by 1, 2),
                t as (
            select view_id, json_build_object(year, data) as data
            from s)

            select view_id, json_agg(data) AS data
            from t
            group by 1
        `

        console.log(sql)
        let res = await db.query(sql);
        res = res.rows || [];

        let tableName = 'datatable_' + s.toLowerCase().split(' ').join('_');
        console.log('creating table', tableName)
        let createSql = `
            CREATE TABLE IF NOT EXISTS ${schema}.${tableName}
            (
                ${res.map(r => `"${r.view_id}" json`).join(', ')}
            )
        `;
        console.log('create table', createSql);
        await db.query(createSql);

        let insertSql = (viewId, data) => `
            INSERT INTO ${schema}.${tableName}("${viewId}")
            VALUES (${`'${JSON.stringify(data)}'::json`})
        `;

        let updateSql = (viewId, data) => `
            UPDATE ${schema}.${tableName}
            SET "${viewId}" = ${`'${JSON.stringify(data)}'::json`}
        `;

        return res.reduce((acc, r, i) => {
            return acc.then(() => {
                if (i === 0) {
                    return db.query(insertSql(r.view_id, r.data))
                } else {
                    return db.query(updateSql(r.view_id, r.data))
                }
            })
        }, Promise.resolve())
    }), Promise.resolve())
}

fetch()