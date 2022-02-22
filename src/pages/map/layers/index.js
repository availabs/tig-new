import {TestTipLayerFactory} from "./tipLayer";
import {SED2040CountyLevelForecastLayerFactory} from "./SED2040CountyLevelForecastLayer";
import {SED2040TazLevelForecastLayerFactory} from "./SED2040TazLevelForecastLayer";
import {SED2050CountyLevelForecastLayerFactory} from "./SED2050CountyLevelForecastLayer";
import {SED2055CountyLevelForecastLayerFactory} from "./SED2055CountyLevelForecastLayer";
import {SED2055TazLevelForecastLayerFactory} from "./SED2055TazLevelForecastLayer";
import {ACSCensusLayerFactory} from "./ACSCensusLayer";
import {BPMPerformanceMeasuresLayerFactory} from "./BPMPerformanceMeasuresLayer";
import {HubBoundTravelDataLayerFactory} from "./HubBoundTravelDataLayer";
import {RTPProjectDataLayerFactory} from "./RTPProjectDataLayer";
import {NPMRDSLayerFactory} from './npmrds';

export const layers = {
    "acs_census": ACSCensusLayerFactory,

    "sed_county_2040": SED2040CountyLevelForecastLayerFactory, //done
    "sed_county_2050": SED2040CountyLevelForecastLayerFactory, //done
    "sed_county_2055": SED2055CountyLevelForecastLayerFactory, // taz?

    "sed_taz_2040": SED2040TazLevelForecastLayerFactory, //done
    "sed_taz_2055": SED2040TazLevelForecastLayerFactory, // no data!

    "tip": TestTipLayerFactory,
    'bpm_performance': BPMPerformanceMeasuresLayerFactory,
    'hub_bound_travel_data': HubBoundTravelDataLayerFactory,
    'rtp_project_data': RTPProjectDataLayerFactory,
    'npmrds': NPMRDSLayerFactory
}

