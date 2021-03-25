import React from "react"

import * as d3 from "d3"

import { INTERVALS, WEEKDAYS } from "../wrappers/utils"

const flagBadData = (d, { mean, dev }, mult = 2) => {
  return (dev === undefined) ||
    (
      (dev !== 0) &&
      (
        d > Math.ceil(mean + dev * mult) ||
        d < Math.floor(mean - dev * mult)
      )
    );
}

const DataChart = ({ data }) => {

  const dataByIntervals = React.useMemo(() => {
    const intervals = INTERVALS.map(i => ({ data: [] }));
    data.forEach(cnt => {
      if (cnt.dow === 0 || cnt.dow === 6) return;
      cnt.data.forEach((d, i) => {
        if (cnt.dow === 1 && i <= 5) return;
        if (cnt.dow === 5 && i >= 12) return;
        intervals[i].data.push(d);
      })
    })
    intervals.forEach(int => {
      const data = int.data.filter(Boolean);
      int.min = d3.min(data);
      int.max = d3.max(data);
      int.mean = d3.median(data);
      int.dev = data.length === 1 || int.mean === undefined ? undefined :
        Math.max(2.5, int.mean * 0.25);
    })
    return intervals;
  }, [data]);

  // const stats = React.useMemo(() => {
  //   const allData = []
  //   data.forEach(cnt => {
  //     if (cnt.dow === 0 || cnt.dow === 6) return;
  //     cnt.data.forEach((d, i) => {
  //       if (cnt.dow === 1 && i <= 5) return;
  //       if (cnt.dow === 5 && i >= 12) return;
  //       (d !== 0) && allData.push(d);
  //     })
  //   })
  //   return { mean: d3.mean(allData), dev: d3.deviation(allData) };
  // }, [data]);

  return (
    <div className="table table-fixed w-full">
      <div className="table-row bg-blueGray-800">
        <div className="table-cell border-r border-b pl-2 pt-1 rounded">
          DoW
        </div>
        { INTERVALS.map((d, i) => (
            <div key={ i } className="table-cell border-b text-center pt-1">
              { i + 1 }
            </div>
          ))
        }
      </div>
      { data.map(d => (
          <div key={ d.date } className="table-row">
            <div className="table-cell border-r pl-2 bg-blueGray-800">
              { WEEKDAYS[d.dow] }
            </div>
            { d.data.map((dd, i) => (
                <div key={ i }
                  className={ `
                    table-cell text-center
                    ${ d.dow === 0 || d.dow === 6 ? "opacity-25" :
                      d.dow === 1 && i <= 5 ? "opacity-25" :
                      d.dow === 5 && i >= 12 ? "opacity-25" :
                      dd === 0 ? "opacity-25" :
                      // flagBadData(dd, stats) ? "text-red-500" :
                      flagBadData(dd, dataByIntervals[i]) ? "text-red-500" :
                      flagBadData(dd, dataByIntervals[i], 1.5) ? "text-yellow-500" : ""
                    }
                  ` }>
                  { dd }
                </div>
              ))
            }
          </div>
        ))
      }
    </div>
  )
}
export default DataChart;
