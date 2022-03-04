import React from "react"
import {ScalableLoading} from "@availabs/avl-components";


const Download = ({inactiveLayers, activeLayers, MapActions, ...rest}) => {
    const [loading, setLoading] = React.useState(false);
    const [layer, setLayer] = React.useState();

    React.useEffect(() => {
        return layer && layer.download ? layer.download(setLoading) : ''
    }, [layer])
    return (
        <>
            <h4>Download</h4>
            {activeLayers.map((layer, lI) =>
                <div key={layer.name}>
                    <div className='cursor-pointer' onClick={async (e) => {
                        e.preventDefault();
                        setLayer(layer)
                        setLoading(true)
                    }}>
                        {layer.name}
                    </div>

                    {loading && (
                        <div id={lI} className={'flex text-xs'}>
                            <div className={'self-center'}><ScalableLoading scale={0.3}/></div>
                            The exporting task has been created, it may take a short while to get processed. Please
                            don't navigate away from page.</div>
                    )}
                </div>
            )
            }
        </>
    )
}

export default Download