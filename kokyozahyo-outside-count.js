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
// const prefCode = "28" // 都道府県コードを第一引数で指定する

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

  const stringFeatures = raw.split("\n")
  const 筆features = [];
  let is筆InsideCity;

  for (const feature of stringFeatures) {
    if (feature === "" ) {
      continue;
    }

    const 筆feature = JSON.parse(feature)

    if (筆feature.properties.地番.match(/^地区外|別図/)) {
      continue;
    }

    筆features.push(筆feature)
  }

  const hullPolygon = turf.convex(turf.featureCollection(筆features))
  console.log(hullPolygon)
  const hullPolygonArea = turf.area(hullPolygon)

  // 市区町村のポリゴンをループする
  for (const cityFeature of city.features) {

    const insideCityPolygon = turf.intersect(hullPolygon, cityFeature);
    if (insideCityPolygon === null) {
      continue;
    }
    const insideCityPolygonArea = turf.area(insideCityPolygon)
    const insideCityRatio = insideCityPolygonArea / hullPolygonArea

    // 外に出ている面積が 5% 未満なら、市区町村の中に筆があると判断する
    if (insideCityRatio > 0.95) {
      is筆InsideCity = true;
      break;
    } else {
      is筆InsideCity = false;
    }
  }

  if (!is筆InsideCity) {
    outsideFiles.push([`${basename}.zip`])
  }
}

const csvWriterOutside = createArrayCsvWriter({
  path: `./output/${prefCode}_all_kyokyozahyo_outside_files.csv`,
  header: ['zip_file']
})
csvWriterOutside.writeRecords(outsideFiles)


const errorPref = createArrayCsvWriter({
  path: `./output/${prefCode}_error.csv`,
  header: ['error_city_code_from_xml_not_found_in_admins']
})
errorPref.writeRecords(errorFiles)
