const db = require('./db.js');
var sql = require('sql');

sql.setDialect('postgres');


const fetch = async () => {
    let sources = [
        '2040 SED County Level Forecast Data',
        '2050 SED County Level Forecast Data',

        '2040 SED TAZ Level Forecast Data',
        //     // '2050 SED TAZ Level Forecast Data', -- no data
        '2055 SED TAZ Level Forecast Data'
    ]

    for (const s of sources) {
        console.log('source', s);

        const sql = `
        with s as (
            SELECT view_id,
                   df.year,
                   array_agg(json_build_object('value', value, 'area', areas.name, 'type', areas.type, 'gid',
                                               base_geometry_id
                       ${s.includes('TAZ') ? `, 'enclosing_name', enclosing_name, 'enclosing_type', enclosing_type` : ``}
                       )) AS data
            FROM public.demographic_facts df
                
                     JOIN public.areas areas
                          ON area_id = areas.id

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
             t as (select view_id, json_build_object(year, data) as data from s)

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
            CREATE TABLE IF NOT EXISTS public.${tableName}
            (
                ${res.map(r => `"${r.view_id}" json`).join(', ')}
            )
    `;

        let insertSql = `
            INSERT INTO public.${tableName}( ${res.map(r => `"${r.view_id}"`).join(', ')} )
            VALUES (
                    ${
                    res.map(r => `'${JSON.stringify(r.data)}'::json`).join(' ,')
                }
                    )
    `;

        await db.query(createSql);
        await db.query(insertSql);

    }
}

fetch()