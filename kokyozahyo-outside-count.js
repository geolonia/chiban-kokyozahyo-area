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
    const code = 筆feature.properties.市区町村コード
    const prefCode = code.slice(0, 2)

    const cityData = fs.readFileSync(`./admins/${prefCode}/${code}.json`, "utf8");
    const city = JSON.parse(cityData)

    let is筆InsideCity;

    // 市区町村ポリゴンをループする。筆のポリゴンがいずれかの市区町村ポリゴンの内側にあるかどうかを調べる
    for (const cityFeature of city.features) {

      // generate feature Collection from feature

      // マルチポリゴンから ポイントの featureCollection を作る
      const points = turf.explode(筆feature)

      // ポイントの featureCollection から convex hull を作る
      const hullPolygon = turf.concave(points)
      out = hullPolygon

      // is筆InsideCity = turf.booleanWithin(筆feature, cityFeature)

      // if (is筆InsideCity) {
      //   break
      // }
    }


  }
}
console.log(JSON.stringify(out))
