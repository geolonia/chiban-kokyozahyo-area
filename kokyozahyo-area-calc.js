#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf")
const path = require("path")
const { createArrayCsvWriter } = require('csv-writer')
const csvHeaders = ["code", "area"]

const cityTotals = {}
const cityTotalsCSV = []
const cityTotalsCSVWriter = createArrayCsvWriter({
  path: 'city_kokyozahyo_area.csv',
  header: csvHeaders
})

const prefTotals = {}
const prefTotalsCSV = []
const prefTotalsCSVWriter = createArrayCsvWriter({
  path: 'pref_kokyozahyo_area.csv',
  header: csvHeaders
})

glob.sync("./all_zips/*.geojson").forEach(file => {

  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);

  const basename = path.basename(file, ".geojson")
  const code = basename.split("-")[0]
  const prefCode = code.slice(0, 2)

  for (const feature of data.features) {

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

for (const [code, area] of Object.entries(prefTotals)) {
  prefTotalsCSV.push([code, area])
}
prefTotalsCSVWriter.writeRecords(prefTotalsCSV)

for (const [code, area] of Object.entries(cityTotals)) {
  cityTotalsCSV.push([code, area])
}
cityTotalsCSVWriter.writeRecords(cityTotalsCSV)