#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf");
let out = {};

// const files = glob.sync("../all_zips/*.ndgeojson"); TODO: 本番ではこっち
const files = glob.sync("./all_zips/*.ndgeojson"); 

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

    const code = 筆feature.properties.市区町村コード
    const prefCode = code.slice(0, 2)

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

    console.log(`${file} ${筆feature.properties.地番} ${is筆InsideCity}`)
  }
}