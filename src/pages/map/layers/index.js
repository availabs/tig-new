import {TestTipLayerFactory} from "./tipLayer";
import {SED2040CountyLevelForecastLayerFactory} from "./SED2040CountyLevelForecastLayer";
import {SED2040TazLevelForecastLayerFactory} from "./SED2040TazLevelForecastLayer";
import {SED2050CountyLevelForecastLayerFactory} from "./SED2050CountyLevelForecastLayer";
import {SED2055CountyLevelForecastLayerFactory} from "./SED2055CountyLevelForecastLayer";
import {SED2055TazLevelForecastLayerFactory} from "./SED2055TazLevelForecastLayer";

export const layers = {
    "tig": TestTipLayerFactory,
    "sed_county_2040": SED2040CountyLevelForecastLayerFactory,
    "sed_county_2050": SED2050CountyLevelForecastLayerFactory,
    "sed_taz_2040": SED2040TazLevelForecastLayerFactory,
    "sed_county_2055": SED2055CountyLevelForecastLayerFactory,
    "sed_taz_2055": SED2055TazLevelForecastLayerFactory
}

