#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const path = require("path")
const turf = require("@turf/turf")
const { createArrayCsvWriter } = require('csv-writer')

const csvHeaders = ["code", "total_area"]
const cityTotals = {}
const cityTotalsCSV = []
const prefTotals = {}
const prefTotalsCSV = []

glob.sync("./data/admins/*/*.json").forEach((file, index) => {

  const raw = fs.readFileSync(file, "utf8")
  const data = JSON.parse(raw)
  const code = path.basename(file, ".json")
  const prefCode = code.slice(0, 2)

  for (const feature of data.features) {
    const area = turf.area(feature) // in square meters

    if (!cityTotals[code]) {
      cityTotals[code] = 0
    }

    cityTotals[code] += area

    if (!prefTotals[prefCode]) {
      prefTotals[prefCode] = 0
    }

    prefTotals[prefCode] += area
  }
})

for (const [code, area] of Object.entries(cityTotals)) {
  cityTotalsCSV.push([code, area])
}
createArrayCsvWriter({
  path: `./output/city_admins_area.csv`,
  header: csvHeaders
}).writeRecords(cityTotalsCSV)

for (const [code, area] of Object.entries(prefTotals)) {
  prefTotalsCSV.push([code, area])
}
createArrayCsvWriter({
  path: `./output/pref_admins_area.csv`,
  header: csvHeaders
}).writeRecords(prefTotalsCSV)





