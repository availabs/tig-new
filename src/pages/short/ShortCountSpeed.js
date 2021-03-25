import React from "react"

import { format as d3format, rollups, group } from "d3"
import get from "lodash.get"

import { Table, Select } from "@availabs/avl-components"

import { BarGraph } from "avl-graph/src"

import CountMeta from "./components/CountMeta"

import { COLORS, BINS, SPEED_BINS, FED_DIRS, dataIntervalToTime } from "./wrappers/utils"

import { ValueDisplay } from "./components/CountMeta"
import DataChart from "./components/DataChart"
import CountStatus from "./components/CountStatus"

const COLUMNS = [
  { accessor: "rc_station",
    Header: "RC Station ID"
  },
  { accessor: "date",
    Header: "Date",
    Cell: ({ value }) => (
      <span>
        { new Date(value).toDateString() }
      </span>
    )
  },
  { accessor: "region",
    Header: "Region"
  },
  { accessor: "total",
    Header: "Total",
    Cell: ({ value }) => valueFormat(value)
  }
]

const reduceGroups = group => {
  return group.reduce((a, c) => {
    c.bins.forEach((v, i) => {
      const b = `bin_${ i + 1 }`;
      a[b] += +v;
    })
    return a;
  }, BINS.reduce((a, c) => ({ ...a, [c]: 0 }), {}))
}

const keyFormat = bin => {
  const index = BINS.indexOf(bin);
  return SPEED_BINS[index];
}
const valueFormat = d3format(",d");

const dirFormat = d => FED_DIRS[d];

const ShortCountSpeed = ({ count_id, counts, weeklyAvg, user, meta, updateMeta }) => {

  const [dateIndex, setDateIndex] = React.useState(0);

  const groupedByDir = React.useMemo(() => {
    return group(counts, d => d.federal_direction);
  }, [counts]);

  const grouped = React.useMemo(() => {
    return group(counts, d => d.federal_direction, d => d.date);
  }, [counts]);

  const rolledup = React.useMemo(() => {
    return rollups(counts, reduceGroups,
      d => d.federal_direction, d => d.date, d => d.data_interval
    )
  }, [counts]);

  const dates = get(rolledup, [0, 1], [])
    .map(([date], i) => ({
      index: i, date
    })).sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());

  const date = get(dates, [dateIndex, "date"]);

  const barData = React.useMemo(() => {
    return rolledup.map(([dir, byDate]) => ({
      dir,
      data: byDate.sort((a, b) => new Date(a[0]).valueOf() - new Date(b[0]).valueOf())
        [dateIndex][1]
          .map(([di, bins]) => ({
            data_interval: di,
            ...bins
          })).sort((a, b) => +a.data_interval - +b.data_interval)
    }));
  }, [rolledup, dateIndex]);

console.log(weeklyAvg)

  const weeklyAvgBarData = React.useMemo(() => {
    const barData = [];
    if (weeklyAvg.length) {
      BINS.forEach((b, i) => {
        const data = {
          index: `${ b }`
        }
        weeklyAvg.forEach(avg => {
          data[avg.federal_direction] = avg.bins[i]
        })
        barData.push(data);
      })
    }
    return barData;
  }, [weeklyAvg]);

  return (
    <div className="m-10 grid grid-cols-1 gap-y-6">
      <div className="text-5xl font-bold">
        <div className="mb-2">Count ID: { count_id }</div>
        { user.authLevel < 5 ? null :
          <>
            <div className="border rounded-sm"/>
            <div className="text-base font-normal mt-2">
              <CountStatus { ...meta } updateMeta={ updateMeta }/>
            </div>
          </>
        }
        <div className="border-2 rounded-sm"/>
      </div>

      <div className="border-2 rounded-sm"/>

      <div className="flex items-center max-w-md">
        <span className="mr-2 font-bold">Select a  date:</span>
        <div className="flex-1">
          <Select options={ dates }
            multi={ false }
            searchable={ false }
            removable={ false }
            value={ dateIndex }
            onChange={ setDateIndex }
            accessor={ d => d.date }
            valueAccessor={ d => d.index }/>
        </div>
      </div>

      { barData.map(({ dir, data }) => (
          <div key={ dir }>
            <CountMeta dir={ dir }
              counts={ grouped.get(dir).get(date) }/>
            <div style={ { height: "24rem" } }>
              <BarGraph colors={ COLORS }
                data={ data } keys={ BINS }
                indexBy="data_interval"
                margin={ { left: 100, bottom: 50 } }
                padding={ 0 }
                hoverComp={ {
                  indexFormat: dataIntervalToTime,
                  keyFormat,
                  valueFormat
                } }
                axisBottom={ {
                  tickDensity: 1.5,
                  format: dataIntervalToTime
                } }
                axisLeft={ {
                  label: "Vehicles"
                } }/>
            </div>
            { user.authLevel < 5 ? null :
              <SpeedDataTable counts={ groupedByDir.get(dir) }/>
            }
          </div>
        ))
      }

      <div>
        <div className="text-2xl font-bold flex">
          Weekly Averages
        </div>

        <div className="border rounded-sm"/>
        <div className="mt-2 flex flex-wrap">
          <ValueDisplay label="Start Date"
            value={ [...new Set(weeklyAvg.map(avg => new Date(avg.date).toDateString()))] }/>
        </div>
        <div className="border rounded-sm"/>

        { !weeklyAvgBarData.length ? null :
          <div style={ { height: "24rem" } }>
            <BarGraph data={ weeklyAvgBarData }
              keys={ barData.map(({ dir }) => dir) }
              margin={ { left: 100, bottom: 50 } }
              padding={ 0.25 }
              groupMode="grouped"
              hoverComp={ {
                keyFormat: dirFormat,
                valueFormat,
                indexFormat: keyFormat
              } }
              axisBottom={ {
                label: "Speed Bins",
                tickDensity: 0.75,
                format: keyFormat
              } }
              axisLeft={ {
                label: "Counts",
                format: valueFormat
              } }/>
          </div>
        }
      </div>

      <Table data={ counts }
        columns={ COLUMNS }
        sortBy="total"
        sortOrder="desc"/>

    </div>
  )
}
export default ShortCountSpeed;

const reducer = group => {
return group.reduce((a, c) => {
  a.date = a.date || c.date;
  a.dow = a.dow || new Date(c.date).getUTCDay();

  c.bins.forEach((d, i) => {
    if (!a.bins[i]) {
      a.bins[i] = 0;
    }
    a.bins[i] += d;
  })
  return a;
}, { bins: new Array(15) })
}

const SpeedDataTable = ({ counts }) => {

  const binnedIntervals = React.useMemo(() => {
    const binMap = {};

    const rolledup = rollups(counts, reducer, d => d.date, d => Math.floor(d.data_interval))
      .sort((a, b) => {
        return +a[0].replace(/[-]/g, "") - +b[0].replace(/[-]/g, "");
      });

    rolledup.forEach(([date, dGroup]) => {
      dGroup.sort((a, b) => {
        return +a[0] - +b[0];
      })
      dGroup.forEach(([interval, data]) => {
        data.bins.forEach((d, i) => {
          if (!binMap[i]) {
            binMap[i] = {};
          }
          if (!binMap[i][date]) {
            binMap[i][date] = {
              date,
              dow: new Date(date).getUTCDay(),
              data: new Array(24)
            }
            for (let ii = 0; ii < 24; ++ii) {
              binMap[i][date].data[ii] = 0;
            }
          }
          binMap[i][date].data[interval - 1] = d;
        })
      })
    })
    return Object.keys(binMap)
      .sort((a, b) => +a - +b)
      .map(b =>
        Object.keys(binMap[b])
          .sort((a, b) => {
            return +a[0].replace(/[-]/g, "") - +b[0].replace(/[-]/g, "");
          })
          .map(d => binMap[b][d])
      );
  }, [counts])

  const [bin, setBin] = React.useState(0);

  return (
    <div>
      <div className="flex items-end">
        { binnedIntervals.map((b, i) => (
            <div key={ i }
              className={ `
                ${ bin === i ?
                  "text-blueGray-100 bg-blueGray-800 px-5 pt-2 font-bold" :
                  "px-4 pt-1 bg-blueGray-900 text-blueGray-400"
                }
                ${ i > 0 ? "ml-2" : "" }
                rounded-t cursor-pointer transition
                hover:bg-blueGray-800 hover:text-blueGray-100
              ` }
              onClick={ e => setBin(i) }>
              Bin { i + 1 }
            </div>
          ))
        }
      </div>
      <div>
        <DataChart data={ binnedIntervals[bin] }/>
      </div>
    </div>
  )
}
