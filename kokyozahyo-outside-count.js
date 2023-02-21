#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf");
const { createArrayCsvWriter } = require('csv-writer')
const { updateLatestCityCode } = require("./util/update-latest-city-code")
const outsideFiles = []
const errorFiles = []

const args = process.argv.slice(2)
const prefCode = args[0] // 都道府県コードを第一引数で指定する

const files = glob.sync(`../all_zips/${prefCode}*.ndgeojson`);
// const files = glob.sync(`./test/${prefCode}*.ndgeojson`);

// 地番住所の ndgeojson ファイルを読み込む
for (const file of files) {
  
  // 市区町村のポリゴンの中に筆があるかチェックする
  const basename = file.split("/").pop().split(".")[0]
  const code = updateLatestCityCode(basename.split("-")[0])

  let cityData;
  try {
    cityData = fs.readFileSync(`./data/admins/${prefCode}/${code}.json`, "utf8");
  } catch (e) {
    console.log(`地番住所からリクエストがあった市区町村コード ${code} が、./data/admins/${prefCode}/${code}.json に存在しません`)
    errorFiles.push([`${prefCode}/${code}.json`])
    continue;
  }

  // 市区町村のGeoJSONを読み込む
  const city = JSON.parse(cityData)
  // 筆の ndgeojson ファイルを読み込む
  const raw = fs.readFileSync(file, "utf8");
  const features = raw.split("\n")

  let is筆InsideCity;

  for (const feature of features) {

    // .split で最後の要素が空文字列になるので、それを除外する
    if (!feature) {
      continue;
    }

    const 筆feature = JSON.parse(feature)

    if (!筆feature.properties.地番.match(/^[0-9]/)) {
      continue;
    }

    // 市区町村のポリゴンをループする
    for (const cityFeature of city.features) {

      const hullPolygon = turf.convex(筆feature)
      is筆InsideCity = turf.booleanWithin(hullPolygon, cityFeature)

      if (is筆InsideCity) {
        // 筆は市内にあるので、他の市区町村のポリゴンをチェックする必要はない
        break;
      }
    }

    if (!is筆InsideCity) {
      // "筆は市外にあるので、他のこのファイルの筆をチェックする必要はない"
      outsideFiles.push([`${basename}.zip`,筆feature.properties.地番])
      break;
    }
  }
}

const csvWriterOutside = createArrayCsvWriter({
  path: `./output/${prefCode}_all_kyokyozahyo_outside_files.csv`,
  header: ['zip_file', 'chiban']
})
csvWriterOutside.writeRecords(outsideFiles)


const errorPref = createArrayCsvWriter({
  path: `./output/${prefCode}_error.csv`,
  header: ['error_city_code_from_xml_not_found_in_admins']
})
errorPref.writeRecords(errorFiles)
