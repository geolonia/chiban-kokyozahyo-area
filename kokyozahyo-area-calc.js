#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf")
const path = require("path")
const { createArrayCsvWriter } = require('csv-writer')
const { updateLatestCityCode } = require("./util/update-latest-city-code")
const csvHeaders = ["code", "kokyozahyo_area"]

const cityTotals = {}
const cityTotalsCSV = []

const prefTotals = {}
const prefTotalsCSV = []

const args = process.argv.slice(2)
const prefCode = args[0] // 都道府県コードを第一引数で指定する

// const files = glob.sync(`../all_zips/${prefCode}*.ndgeojson`);
const files = glob.sync(`./test/${prefCode}*.ndgeojson`);
files.forEach((file, index) => {

  const raw = fs.readFileSync(file, "utf8");
  const features = raw.split("\n")

  for (const raw of features) {
    if (!raw) {
      continue;
    }

    const feature = JSON.parse(raw)
    const basename = path.basename(file, ".ndgeojson")
    const code = updateLatestCityCode(basename.split("-")[0])

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

// km に変換、小数点第二位で四捨五入
const convertKm = (area) => {
  const areakm = area / 1000000
  return Math.round(areakm * 100) / 100
}

for (const [code, area] of Object.entries(cityTotals)) {
  const area_km = convertKm(area)
  cityTotalsCSV.push([code, area_km])
}
createArrayCsvWriter({
  path: `./output/${prefCode}_city_kokyozahyo_area.csv`,
  header: csvHeaders
}).writeRecords(cityTotalsCSV)

for (const [code, area] of Object.entries(prefTotals)) {
  const area_km = convertKm(area)
  prefTotalsCSV.push([code, area_km])
}
createArrayCsvWriter({
  path: `./output/${prefCode}_pref_kokyozahyo_area.csv`,
  header: csvHeaders
}).writeRecords(prefTotalsCSV)
