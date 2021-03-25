import React from "react"

import { format as d3format, rollups, group } from "d3"

import { Table } from "@availabs/avl-components"

import { LineGraph, BarGraph } from "avl-graph/src"

import CountMeta from "./components/CountMeta"

import { COLORS, FED_DIRS, INTERVALS, WEEKDAYS } from "./wrappers/utils"

import { ValueDisplay } from "./components/CountMeta"
import DataChart from "./components/DataChart"
import CountStatus from "./components/CountStatus"

const yFormat = d3format(",d"),
  idFormat = (id, { date, dow }) => {
    return `${ date } (${ WEEKDAYS[dow] })`;
  },

  keyFormat = d => FED_DIRS[d],
  indexFormat = i => intervalToTime(i - 1);

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
    Cell: ({ value }) => yFormat(value)
  }
]

const intervalToTime = (i, mod = 1) => {
  const h = Math.floor(+i / mod),
    m = `00${ (+i % mod) * 15 }`,
    hour = h === 0 ? 12 : h > 12 ? h - 12 : h,
    ampm = h < 12 ? "am" : "pm";

  return `${ hour }:${ m.slice(-2) } ${ ampm }`
}

const groupReducer = group => group.map(c => ({
  id: c.id,
  date: c.date,
  dow: new Date(c.date).getUTCDay(),
  sortBy: +c.date.replace(/[-]/g, ""),
  data: c.intervals.map((v, i) => ({
    x: intervalToTime(i, +c.collection_interval === 60 ? 1 : 4),
    y: +v
  }))
})).sort((a, b) => a.sortBy - b.sortBy)

const ShortCountVolume = ({ count_id, counts, weeklyAvg, user, meta, updateMeta }) => {

  const grouped = React.useMemo(() => {
    return group(counts, d => d.federal_direction);
  }, [counts]);

  const lineData = React.useMemo(() => {
    return rollups(counts, groupReducer, d => d.federal_direction)
  }, [counts]);

  const weeklyAvgBarData = React.useMemo(() => {
    const barData = [];
    if (weeklyAvg.length) {
      for (let i = 1; i <= 24; ++i) {
        const interval = {
          index: `${ i }`
        }
        weeklyAvg.forEach(avg => {
          interval[avg.federal_direction] = avg.intervals[i - 1]
        })
        barData.push(interval);
      }
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

      { lineData.map(([dir, data]) => (
          <div key={ dir }>
            <CountMeta dir={ dir }
              counts={ grouped.get(dir) }/>
            <div style={ { height: "24rem" } }>
              <LineGraph data={ data }
                colors={ COLORS }
                hoverComp={ {
                  yFormat,
                  idFormat
                } }
                margin={ { left: 100, bottom: 50 } }
                axisBottom={ {
                  label: "Intervals",
                  tickDensity: 1.5
                } }
                axisLeft={ {
                  label: "Counts",
                  format: yFormat
                } }/>
            </div>
            { user.authLevel < 5 ? null :
              <VolumeDataTable counts={ grouped.get(dir) }/>
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
          { weeklyAvg.map(avg => (
              <ValueDisplay key={ avg.federal_direction }
                label={ `AADT ${ FED_DIRS[avg.federal_direction] }` }
                value={ [yFormat(avg.aadt)] }/>
            ))
          }
          <ValueDisplay label={ `AADT Total` }
            value={ [yFormat(weeklyAvg.reduce((a, c) => a + c.aadt, 0))] }/>
          <ValueDisplay label="Start Date"
            value={ [...new Set(weeklyAvg.map(avg => new Date(avg.date).toDateString()))] }/>
          <ValueDisplay label="Axle Factor"
            value={ [...new Set(weeklyAvg.map(avg => avg.axle_factor))] }/>
          <ValueDisplay label="Seasonal Factor"
            value={ [...new Set(weeklyAvg.map(avg => avg.seasonal_factor))] }/>
        </div>
        <div className="border rounded-sm"/>

        { !weeklyAvgBarData.length ? null :
          <div style={ { height: "24rem" } }>
            <BarGraph data={ weeklyAvgBarData }
              keys={ lineData.map(d => d[0]) }
              margin={ { left: 100, bottom: 50 } }
              padding={ 0.25 }
              groupMode="grouped"
              hoverComp={ {
                keyFormat,
                valueFormat: yFormat,
                indexFormat
              } }
              axisBottom={ {
                label: "Intervals",
                tickDensity: 1.5,
                format: indexFormat
              } }
              axisLeft={ {
                label: "Counts",
                format: yFormat
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
export default ShortCountVolume;

const VolumeDataTable = ({ counts }) => {
  const data = React.useMemo(() => {
    return counts.map(cnt => {
      const data = {
        id: cnt.id,
        date: cnt.date,
        dow: new Date(cnt.date).getUTCDay(),
        data: [...INTERVALS]
      }
      const mod = cnt.collection_interval === 15 ? 4 : 1;
      cnt.intervals.forEach((d, i) => {
        const interval = Math.floor(i / mod);
        data.data[interval] += d;
      })
      return data;
    }).sort((a, b) => a.date.localeCompare(b.date))
  }, [counts]);

  return (
    <div className="mt-2">
      <DataChart data={ data }/>
    </div>
  )
}
