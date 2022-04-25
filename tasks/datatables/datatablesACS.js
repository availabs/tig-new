const db = require('./db.js');
var sql = require('sql');

sql.setDialect('postgres');


const fetch = async () => {
    // change sources below, and server in db.js
    let allSrc = {
        local: [
            'ACS/Census Data'
        ],
        tigtet2: [
            'ACS/Census Data'
        ]
    }
    let sources = allSrc.tigtet2;

    for (const s of sources) {
        console.log('source', s);

        const sql = `
            with s as (
                SELECT view_id,
                       array_agg(json_build_object(
                           'area', areas.name,
                           'fips', lpad(fips_code::text, 11, '0'),
                           'value', value, 
                           'base_value', base_value,
                           'percentage', ("value" / NULLIF("base_value", 0)) * 100,
                           'type', type,
                           'gid', base_geometry_id

                           )) AS data
                FROM public.comparative_facts c
                         JOIN areas
                              ON areas.id = area_id
                WHERE view_id IN (
                    SELECT v.id
                    FROM public.views v
                             JOIN sources s
                                  ON v.source_id = s.id
                    where s.name = 'ACS/Census Data'
                      and deleted_at is null
                )
                group by 1)

        select view_id, data from s
        `

        console.log(sql)
        let res = await db.query(sql);
        res = res.rows || [];

        let tableName = 'datatable_' + s.replace('/', '_').toLowerCase().split(' ').join('_');
        console.log('creating table', tableName)
        let createSql = `
            CREATE TABLE IF NOT EXISTS public.${tableName}
            (
                ${res.map(r => `"${r.view_id}" json`).join(', ')}
            )
    `;
        console.log('create table', createSql)
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