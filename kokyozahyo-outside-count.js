#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf");
const { createArrayCsvWriter } = require('csv-writer')
const { parse } = require('csv-parse/sync');
const { updateLatestCityCode } = require("./util/update-latest-city-code")
const outsideNdGeoJsons = []
const outsideFiles = []
const errorFiles = []

const args = process.argv.slice(2)
// const prefCode = args[0] // 都道府県コードを第一引数で指定する
const prefCode = "28" // 都道府県コードを第一引数で指定する

// const ndgeojsonDir = `../all_zips`
const ndgeojsonDir = `./test`
// const outputDir = `./output`
const outputDir = `./test`

const files = glob.sync(`${ndgeojsonDir}/${prefCode}*.ndgeojson`);


const getCityData = (code, prefCode) => {

  let cityData;
  let error;
  let errorMessage
  try {
    cityData = fs.readFileSync(`./data/admins/${prefCode}/${code}.json`, "utf8");
    cityData = JSON.parse(cityData)
    error = false
  } catch (e) {
    console.log(`地番住所からリクエストがあった市区町村コード ${code} が、./data/admins/${prefCode}/${code}.json に存在しません`)
    cityData = null
    error = true
    errorMessage = `${prefCode}/${code}.json`
  }

  return { cityData, error, errorMessage }
}

const get筆Features = (file) => {
  const raw = fs.readFileSync(file, "utf8");

  const stringFeatures = raw.split("\n")
  const 筆features = [];

  for (const feature of stringFeatures) {
    if (feature === "") {
      continue;
    }

    const 筆feature = JSON.parse(feature)

    if (筆feature.properties.地番.match(/^地区外|別図/)) {
      continue;
    }

    筆features.push(筆feature)
  }

  return 筆features
}

// 地番住所の ndgeojson ファイルを読み込む
for (const file of files) {

  // 市区町村のポリゴンの中に筆があるかチェックする
  const basename = file.split("/").pop().split(".")[0]
  const code = updateLatestCityCode(basename.split("-")[0])

  const { cityData, error, errorMessage } = getCityData(code, prefCode)

  if (error) {
    errorFiles.push([errorMessage])
    continue;
  }

  // 筆の ndgeojson ファイルを読み込む
  const 筆features = get筆Features(file);

  if (筆features.length === 0) {
    continue;
  }

  let is筆InsideCity;
  const hullPolygon = turf.convex(turf.featureCollection(筆features))
  const hullPolygonArea = turf.area(hullPolygon)

  // 市区町村のポリゴンをループする
  for (const cityFeature of cityData.features) {

    const insideCityPolygon = turf.intersect(hullPolygon, cityFeature);

    // 筆のポリゴンが、市区町村外の場合
    if (insideCityPolygon === null) {
      is筆InsideCity = false;
      continue;

      // 筆のポリゴンが市区町村と重なっている場合
    } else {

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
  }

  if (!is筆InsideCity) {
    outsideNdGeoJsons.push(file)
  }
}

// outsideFiles は　xml ファイルの 筆の HullPolygon を作成し、内外比率を計算して判定しているので、
// 島や半島のような形状の市区町村の場合、座標が合っていても外に出ていると判定される可能性がある。
// その為、抽出した結果をもとに、実際の筆ポリゴンで再度判定する必要がある。
for (const file of outsideNdGeoJsons) {

  const basename = file.split("/").pop().split(".")[0]
  const code = updateLatestCityCode(basename.split("-")[0])
  const { cityData, error, errorMessage } = getCityData(code, prefCode)

  if (error) {
    errorFiles.push([errorMessage])
    continue;
  }

  // 筆の ndgeojson ファイルを読み込む
  const 筆features = get筆Features(file);

  let is筆InsideCity;
  for (const 筆feature of 筆features) {

    const 筆featureArea = turf.area(筆feature)

    // 筆が市区町村の中にあるかチェックする
    for (const cityFeature of cityData.features) {

      const insideCityPolygon = turf.intersect(筆feature, cityFeature);

      // 筆のポリゴンが、市区町村外の場合
      if (insideCityPolygon === null) {
        is筆InsideCity = false;
        continue;

        // 筆のポリゴンが市区町村と重なっている場合
      } else {

        const insideCityPolygonArea = turf.area(insideCityPolygon)
        const insideCityRatio = insideCityPolygonArea / 筆featureArea

        if (insideCityRatio > 0.95) {
          is筆InsideCity = true;
          break;
        } else {
          is筆InsideCity = false;
        }
      }
    }

    if (!is筆InsideCity) {
      outsideFiles.push(`${basename}.zip`)
      break;
    }
  }
}

// const csvWriterOutside = createArrayCsvWriter({
//   path: `${outputDir}/${prefCode}_all_kyokyozahyo_outside_files.csv`,
//   header: ['zip_file']
// })
// csvWriterOutside.writeRecords(outsideFiles)


// const errorPref = createArrayCsvWriter({
//   path: `${outputDir}/${prefCode}_error.csv`,
//   header: ['error_city_code_from_xml_not_found_in_admins']
// })
// errorPref.writeRecords(errorFiles)