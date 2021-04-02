import {TestTipLayerFactory} from "./tipLayer";
import {SED2040CountyLevelForecastLayerFactory} from "./SED2040CountyLevelForecastLayer";
import {SEDTazLevelForecastLayerFactory} from "./SEDTazLevelForecastLayer";
import {SED2050CountyLevelForecastLayerFactory} from "./SED2050CountyLevelForecastLayer";

export const layers = {
    "tig": TestTipLayerFactory,
    "sed_county_2040": SED2040CountyLevelForecastLayerFactory,
    "sed_county_2050": SED2050CountyLevelForecastLayerFactory,
    "sed_taz_2040": SEDTazLevelForecastLayerFactory
}

