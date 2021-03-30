import {TestTipLayerFactory} from "./tipLayer";
import {SEDCountyLevelForecastLayerFactory} from "./SEDCountyLevelForecastLayer";
import {SEDTazLevelForecastLayerFactory} from "./SEDTazLevelForecastLayer";

export const layers = {
    "tig": TestTipLayerFactory,
    "sed_county_2040": SEDCountyLevelForecastLayerFactory,
    "sed_taz_2040": SEDTazLevelForecastLayerFactory
}

