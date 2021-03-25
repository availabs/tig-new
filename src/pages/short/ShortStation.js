import React from "react"

import { Link } from "react-router-dom"

import get from "lodash.get"
import styled from "styled-components"
import { format as d3format, groups } from "d3"

import { useTheme, useFalcor, Select } from "@availabs/avl-components"

import { BarGraph } from "avl-graph/src"

import StationVMTGraph from "./components/StationVMTGraph"
import StationTable from "./components/StationTable"

import { BINS, SPEED_BINS, FED_DIRS, VEHICLE_CLASSES } from "./wrappers/utils"

const aadtFormat = d3format(",d"),
  vmtFormat = d3format(",.1f");

const intervalToTime = (i, mod = 1) => {
  const h = Math.floor(+i / mod),
    m = `00${ (+i % mod) * 15 }`,
    hour = h === 0 ? 12 : h > 12 ? h - 12 : h,
    ampm = h < 12 ? "am" : "pm";

  return `${ hour }:${ m.slice(-2) } ${ ampm }`
}

const valueFormat = d3format(",d"),
  keyFormat = d => FED_DIRS[d];
const indexFormat = key => {
  const index = BINS.indexOf(key);
  if (index > -1) {
    return SPEED_BINS[index];
  }
  if (!isNaN(key)) {
    return intervalToTime(key);
  }
  return key;
}

const selector = ({ year }) => year;

const ShortStation = ({ station, years, stations, uploads, index, setIndex }) => {
  const [year, setYear] = React.useState(years[0]);

  const stationsByYear = React.useMemo(() =>
    stations.filter(s => +s.year === +year)
  , [stations, year]);

  return (
    <div className="m-10 grid grid-cols-2 gap-6">
      <div className="text-5xl font-bold col-span-2">
        RC Station ID: { station.stationId }
      </div>

      <div className="col-span-2 border-2 rounded-sm"/>

      <div className="col-span-1">
        <TabSelector currentTab={ year } setTab={ setYear }
          selector={ selector }
          data={ station.data }
          Selected={ Selected }/>
      </div>
      <div className={ `
        col-span-1 rounded bg-blueGray-800 h-full w-full
      ` }>
        <StationVMTGraph data={ station.data }/>
      </div>

      <div className="col-span-2 border-2 rounded-sm"/>

      { !uploads.length ? null :
        <div className="col-span-2">
          <StationBarGraph uploads={ uploads }
            index={ index }
            setIndex={ setIndex }/>
        </div>
      }

      <div className="col-span-2 border-2 rounded-sm"/>

      <div className="col-span-2">
        <StationTable station={ stationsByYear }/>
      </div>
    </div>
  )
}
export default ShortStation;

const StationBarGraph = ({ uploads, index, setIndex }) => {
  const count = uploads[index],
    { id, type, count_id, status } = count,
    [countType, dataType] = type.split(" ");

  const { falcor, falcorCache } = useFalcor();

  React.useEffect(() => {
    falcor.get(
      ["tds", countType, dataType, "weeklyAvg", "byCountId", id, "array"]
    )
  }, [falcor, id, countType, dataType]);

  const weeklyAvg = React.useMemo(() => {
    return get(falcorCache, ["tds", countType, dataType, "weeklyAvg", "byCountId", id, "array", "value"], []);
  }, [falcorCache, id, countType, dataType]);

  const fedDirs = React.useMemo(() => {
    return groups(weeklyAvg, d => d.federal_direction);
  }, [weeklyAvg]);

  const weeklyAvgBarData = React.useMemo(() => {
    const barData = [];
    if (weeklyAvg.length) {
      switch (dataType) {
        case "volume": {
          for (let i = 1; i <= 24; ++i) {
            const interval = {
              index: `${ i }`
            }
            weeklyAvg.forEach(avg => {
              interval[avg.federal_direction] = avg.intervals[i - 1]
            })
            barData.push(interval);
          }
          break;
        }
        case "speed": {
          BINS.forEach((b, i) => {
            const data = {
              index: `${ b }`
            }
            weeklyAvg.forEach(avg => {
              data[avg.federal_direction] = avg.bins[i]
            })
            barData.push(data);
          })
          break;
        }
        case "class": {
          if (weeklyAvg.length) {
            VEHICLE_CLASSES.forEach((vc, i) => {
              const data = {
                index: `${ vc }`
              }
              weeklyAvg.forEach(avg => {
                data[avg.federal_direction] = avg.classes[i]
              })
              barData.push(data);
            })
          }
          break;
        }
        default:
          break;
      }
    }
    return barData;
  }, [weeklyAvg, dataType]);

  return (
    <div>
      <div>
        <div className="font-bold text-2xl">
          Uploaded Counts
        </div>
        <div className="border"/>
        <div className="flex items-center my-2">
          <Link to={ `/${ countType }/${ dataType }/count/${ id }` }
            className="font-bold text-lg block hover:text-cyan-300 mr-4">
            <span className="fa fa-external-link-alt mr-1"/>
            { count_id }
          </Link>
          <Select options={ uploads }
            multi={ false }
            searchable={ false }
            removable={ false }
            value={ index }
            onChange={ setIndex }
            valueAccessor={ d => +d.index }
            accessor={ d => `${ d.type } ${ d.start_date }` }/>
          <span className="font-bold text-lg ml-4">(Status: { status })</span>
        </div>
        <div className="border"/>
      </div>
      <div className=""
        style={ { height: "24rem" } }>
        <BarGraph data={ weeklyAvgBarData }
          keys={ fedDirs.map(d => d[0]).sort((a, b) => +b - +a) }
          margin={ { left: 100, bottom: 50 } }
          padding={ 0.25 }
          groupMode="grouped"
          hoverComp={ {
            keyFormat,
            valueFormat,
            indexFormat
          } }
          axisBottom={ {
            label: dataType === "volume" ? "Intervals" :
              dataType === "class" ? "Vehicle Classes" : "Speed Bins",
            tickDensity: dataType === "speed" ? 0.5 : 1.5,
            format: indexFormat
          } }
          axisLeft={ {
            label: "Counts",
            format: valueFormat
          } }/>
      </div>
    </div>
  )
}

const Selected = ({ selected }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      { selected.data.map(s => <Station key={ s.mpo } { ...s }/>) }
    </div>
  )
}
const Station = props => {
  const {
    mpo, region, county,
    aadt = 0, aadt_combo = 0, aadt_single_unit = 0,
    road_name, length, functional_class
  } = props;

  const classes = functional_class.split(",").sort((a, b) => +a - +b);

  return (
    <>
      <div className="col-span-1">
        <Row large row={ ["MPO", mpo] }/>
        <Row row={ ["Region", region] }/>
        <Row row={ ["County", county] }/>
        <Separator />
        <Row row={ ["VMT (total)", vmtFormat(aadt * length)] }/>
        <Row row={ ["VMT (car)", vmtFormat((aadt - (aadt_combo + aadt_single_unit)) * length)] }/>
        <Row row={ ["VMT (truck)", vmtFormat((aadt_combo + aadt_single_unit) * length)] }/>
        <Separator />
        <Row row={ ["AADT (total)", aadtFormat(aadt)] }/>
        <Row row={ ["AADT (car)", aadtFormat(aadt - (aadt_combo + aadt_single_unit))] }/>
        <Row row={ ["AADT (truck)", aadtFormat(aadt_combo + aadt_single_unit)] }/>
        <Separator />
        <Row row={ ["Miles", vmtFormat(length)] }/>
        <Row row={ [`${ classes.length > 5 ? "Func." : "Functional" } Class${ classes.length > 1 ? "es" : "" }`, classes.join(", ")] }/>
        <ExpandRow row={ [`Road Name${ road_name.length > 1 ? "s" : "" }`, road_name[0]] }
          expand={ road_name.slice(1) }/>
      </div>
      <div className="col-span-1 bg-blueGray-700 h-full flex flex-col justify-center items-center">
        <span className="fa fa-map text-9xl"/>
      </div>
    </>
  )
}
export const Row = ({ row, large = false }) => (
  <div className={ `
    flex hover:bg-blueGray-600 px-2 rounded
    ${ large ? "text-3xl leading-8" : "text-lg leading-7" }
  ` }>
    <div className="font-bold">
      { row[0] }
    </div>
    <div className="flex-1 text-right">
      { row[1] }
    </div>
  </div>
)
export const Separator = () => <div className="rounded border"/>

const ExpandRowContainer = styled.div`
  position: relative;
  white-space: nowrap;
  .expand {
    display: none;
    position: absolute;
    top: 100%;
    left: 0px;
  }
  & > * {
    border-bottom-right-radius: 0px;
  }
  &:hover .expand {
    display: flex;
    pointer-events: none;
  }
`
const ExpandRow = ({ row, expand }) => {
  return (
    <ExpandRowContainer>
      <Row row={ row }/>

      { !expand.length ? null :
        <div style={ {
            maxHeight: "500px"
          } }
          className={ `
            expand rounded-bl rounded-br bg-blueGray-600 px-2 pb-2
            overflow-auto scrollbar-sm flex-row-reverse flex-wrap w-full
          ` }>
          { expand.map((v, i) =>
              <div className="rounded bg-blueGray-500 px-2 ml-1 mb-1 flex-0 text-large leading-7" key={ i }>{ v }</div>
            )
          }
        </div>
      }
    </ExpandRowContainer>
  )
}

const Compare = (a, b) => a === b;

const TabSelector = ({ currentTab, setTab, selector, data, Selected, fullTabs = false, compare = Compare, Tab = DefaultTab }) => {

  const tabs = React.useMemo(() => {
    return data.map(d => {
      const tab = selector(d);
      return {
        tab,
        isCurrent: compare(currentTab, tab),
        onClick: e => setTab(tab)
      }
    })
  }, [data, currentTab, setTab, compare, selector]);

  const theme = useTheme();

  const selected = data.find(d => compare(currentTab, selector(d)));

  return (
    <div>
      <TabContainer>
        { tabs.map(({ tab, ...rest }) =>
            <Tab key={ tab } { ...rest } full={ fullTabs }>
              { tab }
            </Tab>
          )
        }
      </TabContainer>
      <div className={ `
        p-4 ${ theme.menuBg } rounded-bl rounded-br
        ${ fullTabs ? "" : "rounded-tr" }
      ` }>
        <Selected selected={ selected }/>
      </div>
    </div>
  )
}
const TabContainer = styled.div`
  display: flex;
  > *:last-child {
    margin-right: 0px;
  }
`
const DefaultTab = ({ isCurrent, onClick, children, full = false }) => {
  const theme = useTheme();
  return (
    <div onClick={ onClick }
      className={ `
        ${ isCurrent ?
          `${ theme.menuTextActive } ${ theme.menuTextActiveHover }` :
          `${ theme.menuBgHover } ${ theme.menuText } ${ theme.menuTextHover }`
        }
        ${ theme.menuBg }
        rounded-tl rounded-tr pt-1 px-5 text-lg
        mr-2 border-b-2 ${ full ? "flex-1" : "flex-0" } text-center
        ${ isCurrent ? "border-current" : "border-transparent cursor-pointer" }
      ` }>
      { children }
    </div>
  )
}
