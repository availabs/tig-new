const db = require('../datatables/db.js');
var sql = require('sql');
sql.setDialect('postgres');
const get = require('lodash.get');
const fs = require('fs');
const proj4 = require('proj4')
const shapefileToGeojson = require("shapefile-to-geojson");

const shpPath = 'data/shp/'
const geojsonPath = 'data/geojson/'
const shpFile = shpPath + '3.15.2021_TAZOutputs_Final_ESRIMap.shp'
const dbf = shpPath + '3.15.2021_TAZOutputs_Final_ESRIMap.dbf'

const prefix = '2010 - 2055 '
const srcName = '2055 SED TAZ Level Forecast Data'
const tableName = 'datatable_' + srcName.toLowerCase().split(' ').join('_');
const schema = 'sed_taz';

const storeData = (data, path) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
        console.error(err)
    }
}

// -- CREATE TABLE sed_taz.datatable_2050_sed_taz_level_forecast_data
// -- 	(LIKE public.datatable_2050_sed_taz_level_forecast_data including all);
//
// -- INSERT INTO sed_taz.datatable_2050_sed_taz_level_forecast_data
// -- SELECT * FROM public.datatable_2050_sed_taz_level_forecast_data;

const insertSrcSql = (srcName) => `
INSERT INTO public.sources(
	name, current_version, 
	created_at, updated_at, default_data_model, 
	disclaimer)
	VALUES ('${srcName}', 1, 
			(SELECT now()) , (SELECT now()), 'DemographicFact',
		   'Disclaimer for TAZ level Socio-Economic/Demographic Forecasts:

Important: Before gaining access to and downloading these files, please review the following disclaimer.
Consensus county/borough-level Socio-Economic and Demographic (SED) forecasts through a 2050 horizon year were adopted by NYMTC’s Program, Finance and Administration Committee (PFAC) on March 12, 2015.  County/Borough level SED forecasts and anticipated development projects in the region are used to derive the Transportation Analysis Zone (TAZ) allocations.
 The TAZ level forecasts are used in NYMTC’s New York Best Practice Model, which is the regional transportation demand model that NYMTC uses to forecast travel, congestion and mobile source emissions.  However, other uses of these TAZ-level allocations will likely require more localized validation, depending on the intended use of the forecasts.  The TAZ allocations are not formally adopted by PFAC; rather they use the members’ growth assumptions as guidelines to perform the allocations.  For more details on the development of TAZ-level allocations, please refer to the <a href=""https://www.nymtc.org/Portals/0/Pdf/SED/2050%20SED/160107-T6-ZAPMethod-Final.pdf?ver=2016-01-22-130437-170"">Zonal Allocation Methodology memorandum</a>.
The North Jersey Transportation Planning Authority (NJTPA) performs and adopts their own allocation of demographic and employment forecasts to the municipal and TAZ level for their 13 county North Jersey region which will differ from the NYMTC allocated forecasts. This statement is also true for Mercer County in NJ, which is a part of the Delaware Valley Regional Planning Commission (DVRPC) planning region and Fairfield and New Haven Counties in Connecticut.  NYMTC is planning to incorporate NJTPA’s forecasts in the next update of the TAZs later this year.
NYMTC makes no representation of any kind, including, but not limited to, warranties of merchantability or fitness for a particular purpose or use, nor are any such warranties to be implied with respect to the information, data or services furnished herein. In no event shall NYMTC, nor its employees and/or member agencies, become liable to users of the data, information or services provided herein, or to any other party, for any loss or damage, consequential or otherwise, including but not limited to time, money or goodwill, arising from the use, operation or modification of the data or information, or for the failure to transmit a copy of any particular document.
In using the information or data, users assume the risk for relying on such data or information, and further agree to indemnify, defend, and hold harmless NYMTC, and its employees and member agencies from all liability of any nature arising out of or resulting from the lack of accuracy or correctness of the information or data, or the use of the information or data. The user acknowledges that the use of this information or data may be subject to error and omission, and the accuracy of the information provided is not guaranteed or represented to be true, complete, nor correct. 
No person, entity or user shall sell, give or receive for the purpose of selling or offering for sale, any portion of the information or data provided herein, nor may they use the information in a manner that is in violation of any federal, state or local law or regulation. Information contained within this dataset is made available by NYMTC for non-commercial use only. Such use of Website materials, including images and text, is allowed provided that any copies or transmissions of this information keep intact all copyright, credits, and disclaimer information. Any other use of these materials requires prior written authorization by NYMTC.
This information disseminated in the interest of information exchange only. The contents do not necessarily reflect the official views or policies of the Federal Transit Administration, Federal Highway Administration, State of New York, NYMTC’s member agencies, or the municipalities within the NYMTC’s travel demand model region. This information does not constitute a standard, specification or regulation.

Yes, I have reviewed the disclaimer.')
RETURNING id;
`;

const insertViewsSql = `
INSERT INTO public.views(name, source_id, current_version, created_at, updated_at, layer)
	VALUES `;

const insertAccessControls = (srcId) => `
INSERT INTO public.access_controls(
	source_id, role, show, download, comment, created_at, updated_at)
	VALUES (${srcId}, 'agency', true, true, true, (select now()), (select now())),
	(${srcId}, 'public', true, true, false, (select now()), (select now())),
	(${srcId}, null, true, true, false, (select now()), (select now()))
	`

const insertViewsActions = (srcId) => `
with t as (SELECT v.id
	FROM public.views v
	JOIN sources s
	ON v.source_id = s.id
	where s.id = ${srcId}
	order by 1),
	s as (
		select UNNEST('{1,2,3,6,9}'::int[]) a
	),
	st as (
		SELECT * from t cross join s
	)

INSERT INTO public.views_actions
select * from st
`
const insertValuesFn = (srcId, name) => `('${name}', ${srcId}, 1,(SELECT now()), (SELECT now()),'sed_taz_2055')`
const createTableSql = (schema, tableName, viewIds) => `
            CREATE TABLE IF NOT EXISTS ${schema}.${tableName}
            (
                ${viewIds.map(r => `"${r}" json`).join(', ')}
            )
    `
const insertDataSql = (schema, tableName, viewIds, data) => `
            INSERT INTO ${schema}.${tableName} ( ${viewIds.map(r => `"${r}"`).join(', ')} )
            VALUES (
                       ${
                               data
                       }
                   )
`


const nameMapping = {
    TOTPOP: 'Total Population',
    HHPOP: 'Household Population',
    GQPOP: "Group Quarters Population",
    GQPOPINS: "Group Quarters Institutional Population",
    GQPOPSTR: 'GQPOPSTR',
    GQPOPOTH: "Group Quarters Other Population",
    HHNUM: "Households",
    HHSIZE: "Household Size",
    ELF: "Employed Labor Force",
    HHINCX: "Household Income",
    EMPTOT: "Total Employment",
    EMPRET: "Retail Employment",
    EMPOFF: "Office Employment",
    EARNWORK: "Earnings",
    UNVENROL: "University Enrollment",
    K12ETOT: 'K12ETOT'
} // 'Group Quarters Homeless Population', 'School Enrollment'

let data = {}
const main = async () => {

    // const geoJSON = await shapefileToGeojson.parseFiles(shpFile, dbf);
    fs.readFile('./taz_2055.geojson', 'utf-8', async (err, geoJson) => {

        const geoJSON = geoJson.split('\n').filter(i => i.length > 0) // delimiter
        const properties = JSON.parse(geoJSON[0]).properties;

        let viewRes = [
            { id: 211, name: '2010 - 2055 Total Population (test)' },
            { id: 212, name: '2010 - 2055 Household Population (test)' },
            { id: 213, name: '2010 - 2055 Group Quarters Population (test)' },
            {
                id: 214,
                name: '2010 - 2055 Group Quarters Institutional Population (test)'
            },
            { id: 215, name: '2010 - 2055 GQPOPSTR (test)' },
            {
                id: 216,
                name: '2010 - 2055 Group Quarters Other Population (test)'
            },
            { id: 217, name: '2010 - 2055 Households (test)' },
            { id: 218, name: '2010 - 2055 Household Size (test)' },
            { id: 219, name: '2010 - 2055 Employed Labor Force (test)' },
            { id: 220, name: '2010 - 2055 Household Income (test)' },
            { id: 221, name: '2010 - 2055 Total Employment (test)' },
            { id: 222, name: '2010 - 2055 Retail Employment (test)' },
            { id: 223, name: '2010 - 2055 Office Employment (test)' },
            { id: 224, name: '2010 - 2055 Earnings (test)' },
            { id: 225, name: '2010 - 2055 University Enrollment (test)' },
            { id: 226, name: '2010 - 2055 K12ETOT (test)' }
        ]

        // console.log('STEP 1: ')
        // let srcId = await db.query(insertSrcSql('test srcName'));
        // srcId = get(srcId, ['rows', 0, 'id']);
        //
        // if(srcId){
        //     console.log('STEP 2: ')
        //
        //     const insertValues = [...new Set(Object.keys(properties).map(p => p.substring(0, p.length - 2)))]
        //         .filter(p => nameMapping[p])
        //         .map(p => insertValuesFn(srcId,prefix + nameMapping[p] + ' (test)'))
        //         .join(', ');
        //
        //     let viewRes = await db.query(insertViewsSql + insertValues + ' RETURNING id, name');
        //     viewRes = get(viewRes, ['rows'])
        //     console.log(JSON.stringify(viewRes))
        //
        //     console.log('STEP 3: ')
        //     await db.query(insertAccessControls(srcId))
        //     console.log('STEP 4: ')
        //     await db.query(insertViewsActions(srcId))
        //     console.log('STEP 5: ')
        //     await db.query(createTableSql(schema, tableName, viewRes.map(v => v.id)))
        //
            geoJSON
                .map(async (feature) => {
                    feature = JSON.parse(feature)
                    Object.keys(feature.properties)
                        .filter(prop => nameMapping[prop.slice(0, prop.length - 2)])
                        .forEach(prop => {
                            let tmp = get(data, [prop.slice(0, prop.length - 2), `20${prop.slice(-2)}`], [])
                            let currData = {
                                area: feature.properties.TAZ2012.toString(),
                                type: 'taz',
                                value: feature.properties[prop],
                                enclosing_name: feature.properties.County_Nam,
                                enclosing_type: 'county',
                                geom: feature.geometry
                            }

                            tmp.push(currData)
                            data[prop.slice(0, prop.length - 2)] =
                                Object.assign({},
                                    data[prop.slice(0, prop.length - 2)] || {},
                                    {[`20${prop.slice(-2)}`]: tmp})

                        })
                })

        // let viewIds = []

        let d = Object.keys(data)
                .map(async (viewKeys) => {
                    const viewId = get(viewRes.find(view => view.name === prefix + nameMapping[viewKeys] + ' (test)'), 'id')
                    if(viewId){
                        // viewIds.push(viewId)
                        await db.query(insertDataSql(schema, tableName, [viewId], `'${JSON.stringify(data[viewKeys])}'::json`))
                        // return `'${JSON.stringify(data[viewKeys])}'::json`
                    }
                })

        // }else{
        //     console.warn('Error Creating Source.')
        // }
    })
}
// {"value":192132,"area":"1","type":"taz","gid":1484,"enclosing_name":"New York","enclosing_type":"county"}
main()
