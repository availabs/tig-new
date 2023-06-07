const db = require('./db.js');
var sql = require('sql');

sql.setDialect('postgres');

let vars = {
    totpop: { name: 'Total Population' },
    hhpop: { name: 'Households' },
    hhnum: { name: 'Household Population'},
    hhsize: { name: 'Household Size'},
    hhincx: { name: 'Household Income'},
    elf: { name: 'Employed Labor Force'},
    emptot: { name: 'Total Employment'},
    empret: { name: 'Retail Employment'},
    empoff: { name: 'Office Employment'},
    earnwork: { name: 'Earnings'},
    unvenrol: { name: 'University Enrollment'},
    k_12_etot: { name: 'School Enrollment'},
    gqpop: { name: 'Group Quarters Population' },
    gqpopins: { name: 'Group Quarters Institutional Population'},
    gqpopstr: { name: 'Group Quarters Other Population'},
    gqpopoth: { name: 'Group Quarters Homeless Population'}, 
}



const fetch = async () => {
    // change sources below, and server in db.js
    const schema ='sed_taz'
    // const getSourcesSql = `select id from public.sources where datasource_type = 'sed_taz'`
    // let {rows: sources } = await db.query(getSourcesSql);
    // console.log('sources', sources)
    const sources = [{id:70}] 
    return sources
        //.filter(s => s.id === 61)
        .reduce(async (acc, s) => acc.then(async () => {
        //let tablename = `sed_taz_source_${s.id}`
        const sql = `
            with s as (
SELECT
        areas.name,
        df.area_id,
        view_id,
        statistics.name as stat,
        jsonb_agg(
            json_build_object( statistics.name || '_' || df.year, value)
        ) as values
    FROM   public.demographic_facts df
    JOIN public.areas areas                 
        ON area_id = areas.id
    join public.statistics as statistics on statistics.id = df.statistic_id 
    WHERE view_id IN (
        SELECT v.id
        FROM public.views v
        JOIN sources s
        ON v.source_id = s.id
        
        where s.id = ${s.id}
      and deleted_at is null
    )
    group by areas.name, df.area_id,df.view_id, statistics.name
    
),
    t as (
     select name, 
        s.area_id, 
        jsonb_agg(
            values
        ) as value 
    from s
        group by name, s.area_id
    )


    SELECT areas.name as taz, 
        enclosing_name as county, 
        value, 
        st_asgeojson(geom) as geometry 
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
//console.log('sql', sql)
        let res = await db.query(sql);
        res = res.rows || [];

        
        const output = {
            type: 'FeatureCollection',
            features: []
        }

        res.forEach(taz => {
            
            let feature = {
                type: 'Feature',
                properties: {
                    taz: taz.taz,
                    county: taz.county
                },
                geometry: JSON.parse(taz.geometry)
            }
            taz.value.forEach(v => {
                v.forEach(col => {
                    let colName = Object.keys(col)[0]  
                    let colValue =  Object.values(col)[0]
                    let shortName = Object.keys(vars)
                        .filter(k => vars[k].name === colName.split('_')[0])

                    feature.properties[`${shortName[0]}_${colName.split('_')[1]}`] = colValue

                })
            })
            output.features.push(feature)
        })

        console.log(JSON.stringify(output))
        
    }), Promise.resolve())
}

fetch().then(d => {
    //console.log('done')
})