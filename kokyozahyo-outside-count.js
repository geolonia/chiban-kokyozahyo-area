#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")

// const files = glob.sync("../all_zips/*.ndgeojson"); TODO: 本番ではこっち
const files = glob.sync("./all_zips/*.ndgeojson"); 

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const features = raw.split("\n")

  for (const raw of features) {
    if (!raw) {
      continue;
    }
    const feature = JSON.parse(raw)
    const code = feature.properties.市区町村コード
    const prefCode = code.slice(0, 2)

    const cityData = fs.readFileSync(`./admins/${prefCode}/${code}.json`, "utf8");

  }
}