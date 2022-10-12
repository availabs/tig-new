import NpmrdsTable from "./npmrdsTable";
import RtpProjectDataTable from "./rtpProjectDataTable";
import HubBoundTravelDataTable from "./hubBoundTravelDataTable";
import BpmPerformanceDataTable from "./bpmPerformanceDataTable";
import AcsCensusDataTable from "./acsCensusDataTable";
import SEDDataTable from "./SEDDataTable";
import TigDataTable from "./TigDataTable";

export const tables = {
    sed_taz_2040: SEDDataTable, //slow
    sed_taz_2050: SEDDataTable,
    sed_taz_2055: SEDDataTable,

    sed_county_2040: SEDDataTable,
    sed_county_2050: SEDDataTable,
    sed_county_2055: SEDDataTable,

    acs_census: AcsCensusDataTable,

    rtp_project_data: RtpProjectDataTable,
    hub_bound_travel_data: HubBoundTravelDataTable, // huge data, very slow
    bpm_performance: BpmPerformanceDataTable,
    npmrds: NpmrdsTable,
    tip: TigDataTable
}