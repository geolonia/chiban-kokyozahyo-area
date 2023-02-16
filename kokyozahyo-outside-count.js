#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf");
const { createArrayCsvWriter } = require('csv-writer')
const { updateLatestCityCode } = require("./util/update-latest-city-code")

const cityTotals = {}
const cityTotalsCSV = []

const prefTotals = {}
const prefTotalsCSV = []

const outsideFiles = []

const args = process.argv.slice(2)
const prefCode = args[0] // 都道府県コードを第一引数で指定する

const files = glob.sync(`../all_zips/${prefCode}*.ndgeojson`);

// 地番住所の ndgeojson ファイルを読み込む
for (const file of files) {
  
  const raw = fs.readFileSync(file, "utf8");
  const features = raw.split("\n")

  // 筆ごとに処理する
  for (const raw of features) {
    if (!raw) {
      continue;
    }

    const 筆feature = JSON.parse(raw)

    if (!筆feature.properties.地番.match(/^[0-9]/)) {
      continue;
    }

    const basename = file.split("/").pop().split(".")[0]
    const code = updateLatestCityCode(筆feature.properties.市区町村コード)

    const cityData = fs.readFileSync(`./admins/${prefCode}/${code}.json`, "utf8");
    const city = JSON.parse(cityData)

    let is筆InsideCity;

    // 市区町村ポリゴンをループする
    for (const cityFeature of city.features) {

      // 筆の凸包を計算しポリゴンを作る
      const hullPolygon = turf.convex(筆feature)

      is筆InsideCity = turf.booleanWithin(hullPolygon, cityFeature)

      if (is筆InsideCity) {
        break
      }
    }

    if (!cityTotals[code]) {
      cityTotals[code] = {}
    }

    if (!cityTotals[code]['kokyozahyo_total']) {
      cityTotals[code]['kokyozahyo_total'] = 0
    }
    cityTotals[code]['kokyozahyo_total'] += 1

    if (!prefTotals[prefCode]) {
      prefTotals[prefCode] = {}
    }

    if (!prefTotals[prefCode]['kokyozahyo_total']) {
      prefTotals[prefCode]['kokyozahyo_total'] = 0
    }

    prefTotals[prefCode]['kokyozahyo_total'] += 1
    
    
    if (!is筆InsideCity) {

      if (!cityTotals[code]['kokyozahyo_outside']) {
        cityTotals[code]['kokyozahyo_outside'] = 0
      }
      cityTotals[code]['kokyozahyo_outside'] += 1

      if (!prefTotals[prefCode]['kokyozahyo_outside']) {
        prefTotals[prefCode]['kokyozahyo_outside'] = 0
      }
      prefTotals[prefCode]['kokyozahyo_outside'] += 1

      outsideFiles.push([code, `${basename}.zip`, 筆feature.properties.市区町村名, 筆feature.properties.地番])
    }
  }
}

for (const [code, data] of Object.entries(cityTotals)) {
  cityTotalsCSV.push([code, data.kokyozahyo_total, data.kokyozahyo_outside])
}

const csvWriterCity = createArrayCsvWriter({
  path: `./output_kokyozahyo_outside/${prefCode}_city_kokyozahyo_outside.csv`,
  header: ['code', 'kokyozahyo_total', 'kokyozahyo_outside']
})
csvWriterCity.writeRecords(cityTotalsCSV)


for (const [code, data] of Object.entries(prefTotals)) {
  prefTotalsCSV.push([code, data.kokyozahyo_total, data.kokyozahyo_outside])
}

const csvWriterPref = createArrayCsvWriter({
  path: `./output_kokyozahyo_outside/${prefCode}_pref_kokyozahyo_outside.csv`,
  header: ['code', 'kokyozahyo_total', 'kokyozahyo_outside']
})
csvWriterPref.writeRecords(prefTotalsCSV)

const csvWriterOutside = createArrayCsvWriter({
  path: `./output_kokyozahyo_outside/${prefCode}_all_kyokyozahyo_outside_files.csv`,
  header: ['code', 'zip_file', '市区町村名', '地番']
})
csvWriterOutside.writeRecords(outsideFiles)

