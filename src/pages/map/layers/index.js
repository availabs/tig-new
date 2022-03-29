import {TestTipLayerFactory} from "./tipLayer";
import {SED2040CountyLevelForecastLayerFactory} from "./SEDCounty";
import {SEDTazLayerFactory} from "./SEDTaz";

import {ACSCensusLayerFactory} from "./ACSCensusLayer";
import {BPMPerformanceMeasuresLayerFactory} from "./BPMPerformanceMeasuresLayer";
import {HubBoundTravelDataLayerFactory} from "./HubBoundTravelDataLayer";
import {RTPProjectDataLayerFactory} from "./RTPProjectDataLayer";
import {NPMRDSLayerFactory} from './npmrds';

export const layers = {
    "acs_census": ACSCensusLayerFactory,

    "sed_county_2040": SED2040CountyLevelForecastLayerFactory, //done
    "sed_county_2050": SED2040CountyLevelForecastLayerFactory, //done
    "sed_county_2055": SED2040CountyLevelForecastLayerFactory, // taz?

    "sed_taz_2040": SEDTazLayerFactory, //done
    "sed_taz_2050": SEDTazLayerFactory, //done
    "sed_taz_2055": SEDTazLayerFactory, // no data!

    "tip": TestTipLayerFactory,
    'bpm_performance': BPMPerformanceMeasuresLayerFactory,
    'hub_bound_travel_data': HubBoundTravelDataLayerFactory,
    'rtp_project_data': RTPProjectDataLayerFactory,
    'npmrds': NPMRDSLayerFactory
}

