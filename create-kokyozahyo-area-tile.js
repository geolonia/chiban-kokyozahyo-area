#!/usr/bin/env node

const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf")
const path = require("path")
const { parse } = require('csv-parse/sync');

// csv を読み込み
let admins_csv = fs.readFileSync(path.join(__dirname, 'output_admins/city_admins_area.csv'), 'utf8');
let admins = parse(admins_csv);

let kokyozahyo_area = fs.readFileSync(path.join(__dirname, 'output_kokyozahyo/city_kokyozahyo_area.csv'), 'utf8');
let kokyozahyo = parse(kokyozahyo_area);


let features = []

const files = glob.sync("./admins/01/01101.json");
files.forEach((file, index) => {

  const raw = fs.readFileSync(file, "utf8")
  const data = JSON.parse(raw)
  const code = path.basename(file, ".json")
  // const prefCode = code.slice(0, 2)

  const matched_admins = admins.filter((admin) => {
    return admin[0] === code
  })

  const matched_kokyozahyo = kokyozahyo.filter((kokyozahyo) => {
    return kokyozahyo[0] === code
  })

  for (const feature of data.features) {

    feature.properties["kokyozahyo_area"] = matched_admins[0][1]
    feature.properties["admins_area"] = matched_kokyozahyo[0][1]

    features.push(feature)
  }

  data.features = features
  // json で上書きする
  fs.writeFileSync(file, JSON.stringify(data))
})