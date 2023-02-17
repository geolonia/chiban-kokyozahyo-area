#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf");
const { createArrayCsvWriter } = require('csv-writer')
const { updateLatestCityCode } = require("./util/update-latest-city-code")
const progressBar = require("progress-bar-cli");
let startTime = new Date();
const outsideFiles = []

const args = process.argv.slice(2)
const prefCode = args[0] // 都道府県コードを第一引数で指定する

const files = glob.sync(`../all_zips/${prefCode}*.ndgeojson`);
// const files = glob.sync(`./test/${prefCode}*.ndgeojson`);

// 地番住所の ndgeojson ファイルを読み込む
for (const file of files) {
  
  progressBar.progressBar(files.indexOf(file), files.length, startTime);
  const raw = fs.readFileSync(file, "utf8");
  const features = raw.split("\n")
  let is筆InsideCity = false;

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

    let cityData;
    // ファイルが存在するかチェックする
    try {
      cityData = fs.readFileSync(`./data/admins/${prefCode}/${code}.json`, "utf8");
    } catch (e) {
      console.log(`./data/admins/${prefCode}/${code}.json が存在しません`)
      continue;
    }

    const city = JSON.parse(cityData)

    // 市区町村ポリゴンをループする
    for (const cityFeature of city.features) {

      // 筆の凸包を計算しポリゴンを作る
      const hullPolygon = turf.convex(筆feature)

      is筆InsideCity = turf.booleanWithin(hullPolygon, cityFeature)

      if (!is筆InsideCity) {
        break
      }
    }
    
    if (!is筆InsideCity) {
      outsideFiles.push([`${basename}.zip`, 筆feature.properties.市区町村名])
      break;
    }
  }
}

const csvWriterOutside = createArrayCsvWriter({
  path: `./output/${prefCode}_all_kyokyozahyo_outside_files.csv`,
  header: ['zip_file', '市区町村名']
})
csvWriterOutside.writeRecords(outsideFiles)

