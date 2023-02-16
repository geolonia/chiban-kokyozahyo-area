#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf")
const path = require("path")
const { createArrayCsvWriter } = require('csv-writer')
const progressBar = require("progress-bar-cli");
const { updateLatestCityCode } = require("./util/update-latest-city-code")
let startTime = new Date();
const csvHeaders = ["code", "area"]

const cityTotals = {}
const cityTotalsCSV = []

const prefTotals = {}
const prefTotalsCSV = []

let code;
let prefCode;

const files = glob.sync("../all_zips/*.ndgeojson");
files.forEach((file, index) => {

  progressBar.progressBar(index, files.length, startTime);

  const raw = fs.readFileSync(file, "utf8");
  const features = raw.split("\n")

  for (const raw of features) {
    if (!raw) {
      continue;
    }

    const feature = JSON.parse(raw)
    const basename = path.basename(file, ".ndgeojson")
    code = updateLatestCityCode(basename.split("-")[0])
    prefCode = code.slice(0, 2)

    if (!feature.properties.地番.match(/^[0-9]/)) {
      continue;
    }
    
    const area = turf.area(feature) // in square meters

    if (!prefTotals[prefCode]) {
      prefTotals[prefCode] = 0
    }
    prefTotals[prefCode] += area

    if (!cityTotals[code]) {
      cityTotals[code] = 0
    }
    cityTotals[code] += area
  }

})

for (const [code, area] of Object.entries(cityTotals)) {
  cityTotalsCSV.push([code, area])
}
createArrayCsvWriter({
  path: `./output_kokyozahyo/city_kokyozahyo_area.csv`,
  header: csvHeaders
}).writeRecords(cityTotalsCSV)

for (const [code, area] of Object.entries(prefTotals)) {
  prefTotalsCSV.push([code, area])
}
createArrayCsvWriter({
  path: `./output_kokyozahyo/pref_kokyozahyo_area.csv`,
  header: csvHeaders
}).writeRecords(prefTotalsCSV)
