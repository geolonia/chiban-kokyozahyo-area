#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")
const path = require("path")
const files = glob.sync(path.join(__dirname, "../data/admins/**/*.json"));
console.log(files)

for (const file of files) {

  let features = []
  const raw = fs.readFileSync(file, "utf8")
  const data = JSON.parse(raw)
  const code = path.basename(file, ".json")

  for (const feature of data.features) {

    if (!feature.properties["code"]) {
      feature.properties["code"] = code
      features.push(feature)
    } else {
      console.log(`Code property already exsits: ${feature.properties["code"]}`)
    }
  }

  data.features = features
  // json で上書きする
  fs.writeFileSync(file, JSON.stringify(data))

}