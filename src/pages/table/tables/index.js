import NpmrdsTable from "./npmrdsTable";
import RtpProjectDataTable from "./rtpProjectDataTable";
import HubBoundTravelDataTable from "./hubBoundTravelDataTable";
import BpmPerformanceDataTable from "./bpmPerformanceDataTable";
import AcsCensusDataTable from "./acsCensusDataTable";
import SedTaz2055DataTable from "./SedTaz2055DataTable";
import SedCounty2055DataTable from "./SedCounty2055DataTable";
import SedTaz2040DataTable from "./SedTaz2040DataTable";
import SedCounty2050DataTable from "./SedCounty2050DataTable";
import SedCounty2040DataTable from "./SedCounty2040DataTable";
import TigDataTable from "./TigDataTable";

export const tables = {
    sed_taz_2040: SedTaz2040DataTable,
    sed_taz_2050: SedTaz2040DataTable,
    sed_taz_2055: SedTaz2040DataTable,

    sed_county_2040: SedTaz2040DataTable,
    sed_county_2050: SedCounty2050DataTable,
    sed_county_2055: SedCounty2055DataTable,

    acs_census: AcsCensusDataTable,

    rtp_project_data: RtpProjectDataTable,
    hub_bound_travel_data: HubBoundTravelDataTable, // huge data
    bpm_performance: BpmPerformanceDataTable,
    npmrds: NpmrdsTable,
    tip: TigDataTable
}