#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf");
const { createArrayCsvWriter } = require('csv-writer')
const { updateLatestCityCode } = require("./util/update-latest-city-code")

const args = process.argv.slice(2)
const prefCode = args[0] // 都道府県コードを第一引数で指定する
// const prefCode = "28" // 都道府県コードを第一引数で指定する

const ndgeojsonDir = `../all_zips`
// const ndgeojsonDir = `./test`
const outputDir = `./output`
// const outputDir = `./test`

const getCityData = (code) => {

  const prefCode = code.slice(0, 2)

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

const is筆InsideCity = (prefCode, ndgeojsonDir) => {

  const outsideNdGeoJsons = []
  const errorFiles = []

  const files = glob.sync(`${ndgeojsonDir}/${prefCode}*.ndgeojson`);

  // 地番住所の ndgeojson ファイルを読み込む
  for (const file of files) {

    // 市区町村のポリゴンの中に筆があるかチェックする
    const basename = file.split("/").pop().split(".")[0]
    const code = updateLatestCityCode(basename.split("-")[0])

    const { cityData, error, errorMessage } = getCityData(code)

    if (error) {
      errorFiles.push(errorMessage)
      continue;
    }

    // 筆の ndgeojson ファイルを読み込む
    const 筆features = get筆Features(file);

    if (筆features.length === 0) {
      continue;
    }

    let is筆InsideCity;

    for (const 筆feature of 筆features) {

      // 市区町村のポリゴンをループする
      for (const cityFeature of cityData.features) {
  
        const hullPolygon = turf.convex(筆feature)

        if (hullPolygon === null) {
          is筆InsideCity = false
          continue
        }

        is筆InsideCity = turf.booleanWithin(hullPolygon, cityFeature)
  
        if (is筆InsideCity) {
          // 筆は市内にあるので、他の市区町村のポリゴンをチェックする必要はない
          break;
        }
      }
  
      if (!is筆InsideCity) {
        // "筆は市外にあるので、他のこのファイルの筆をチェックする必要はない"
        outsideNdGeoJsons.push(file)
        break;
      }
    }
  }

  return {outsideNdGeoJsons};
}

const inspectOutside筆ByAreaRate = (prefCode, outsideNdGeoJsons) => {

  const outsideFiles = []
  const errorFiles = [];

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
    const combine筆FeatureCollection = turf.combine(turf.featureCollection(筆features))
    const combine筆Feature = combine筆FeatureCollection.features[0]

    // 市区町村のポリゴンを結合
    const combineCityFeatureCollection = turf.combine(turf.featureCollection(cityData.features))
    const combineCityFeature = combineCityFeatureCollection.features[0]

    // 筆のポリゴンが市区町村と重なっているポリゴンを取得
    const insideCityPolygon = turf.intersect(combine筆Feature, combineCityFeature);

    // 筆のポリゴンが市区町村と重なっていない場合、市外と判定する
    if (insideCityPolygon === null) {
      outsideFiles.push([`${basename}.zip`, 1])
      continue;
    }

    const combine筆featureArea = turf.area(combine筆Feature)
    const insideCityPolygonArea = turf.area(insideCityPolygon)


    // 市区町村内の筆の面積が、筆の面積の95%以上なら、市内にあると判定する
    const insideCityRatio = insideCityPolygonArea / combine筆featureArea
    const outsideCityRatio = 1 - insideCityRatio

    outsideFiles.push([`${basename}.zip`, outsideCityRatio])
  }

  return { outsideFiles: outsideFiles, errorFiles }
}

const { outsideNdGeoJsons } = is筆InsideCity(prefCode, ndgeojsonDir);
const { outsideFiles } = inspectOutside筆ByAreaRate(prefCode, outsideNdGeoJsons);

const csvWriterOutside = createArrayCsvWriter({
  path: `${outputDir}/${prefCode}_all_kyokyozahyo_outside_files.csv`,
  header: ['zip_file', 'outside_area_rate']
})
csvWriterOutside.writeRecords(outsideFiles)

module.exports = {
  getCityData,
  get筆Features,
  is筆InsideCity,
  inspectOutside筆ByAreaRate
};