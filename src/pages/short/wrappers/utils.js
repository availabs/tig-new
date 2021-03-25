import { getColorRange } from "@availabs/avl-components"

const colors1 = getColorRange(7, "Set3"),
  colors2 = getColorRange(7, "Set1");

export const COLORS = colors1.reduce((a, c, i) => {
  a.push(c, colors2[i]);
  return a;
}, []);

export const REGIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const CLASSES = [
   1,  2,  4,  6,  7,  8,  9,
  11, 12, 14, 16, 17, 18, 19
];

export const YEARS = [2019, 2018, 2017, 2016];

export const FED_DIRS = {
  1: "North",
  3: "East",
  5: "South",
  7: "West",
  9: "North/South Combined",
  0: "East/West combined"
}

export const VEHICLE_CLASSES = [];
for (let c = 1; c <= 13; ++c) {
  VEHICLE_CLASSES.push(`class_f${ c }`);
}

export const BINS = [];
for (let b = 1; b <= 15; ++b) {
  BINS.push(`bin_${ b }`);
}
export const SPEED_BINS = [
  "20.0 mph or less",
  "20.1 - 25.0 mph",
  "25.1 - 30.0 mph",
  "30.1 - 35.0 mph",
  "35.1 - 40.0 mph",
  "40.1 - 45.0 mph",
  "45.1 - 50.0 mph",
  "50.1 - 55.0 mph",
  "55.1 - 60.0 mph",
  "60.1 - 65.0 mph",
  "65.1 - 70.0 mph",
  "70.1 - 75.0 mph",
  "75.1 - 80.0 mph",
  "80.1 - 85.0 mph",
  "over 85.0 mph"
]

export const dataIntervalToTime = i => {
  const [_h, _m] = i.toString().split("."),
    h = +_h - 1,
    m = `00${ (+_m - 1) * 15 }`,
    hour = h === 0 ? 12 : h > 12 ? h - 12 : h,
    ampm = h < 12 ? "am" : "pm";
  return `${ hour }:${ m.slice(-2) } ${ ampm }`
}


export const GLOBAL_ATTRIBUTES = [
  "id",
  "rc_station",
  "count_id",
  "region_code",
  "county_code",
  "federal_direction",
  "functional_class",
  "factor_group",
  "specific_recorder_placement",
  "channel_notes",
  "date",
  "collection_interval"
]

export const INTERVALS = new Array(24);
for (let i = 0; i < 24; ++i) {
  INTERVALS[i] = 0;
}
export const WEEKDAYS = ["Sn", "Mn", "Tu", "We", "Th", "Fr", "St"]
