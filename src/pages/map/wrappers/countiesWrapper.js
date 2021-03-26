import React from "react"

import get from "lodash.get"

const countiesWrapper = Component =>
    ({ falcor, falcorCache, ...props }) => {
        React.useEffect(() => {
            falcor.get(["geo", ['36', '34', '09'], ['counties']])
                .then(res => {

                    const graph = get(res,['json',"geo"],null)
                    const counties = Object.keys(graph).filter(d => d!== '$__path').reduce((a,c) =>{
                      a.push(...get(graph,[c,'counties'],[]))
                        return a
                    },[])
                    return falcor.get(
                        ["geo", counties, "name"]
                    ).then(res =>{
                        return res
                    })

                });
        }, [falcor]);

        const data = React.useMemo(() =>
            getCountiesFromCache(falcorCache), [falcorCache]
        );

        return (
            <Component { ...props } data={data}/>
        )
    }
export default countiesWrapper;


const getCountiesFromCache = falcorCache => {
    const graph = get(falcorCache,['geo'],{})
    return Object.keys(graph).map(geoid => {
        if(geoid.length === 5){
            const name = get(graph, [geoid, "name"],'');
            return { geoid, name };
        }

    }).sort((a, b) => a.name.localeCompare(b.name)).filter(d => d);

}
