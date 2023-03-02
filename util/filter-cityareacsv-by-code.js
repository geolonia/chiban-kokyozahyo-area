#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require("glob")
const { createArrayCsvWriter } = require('csv-writer');
const { parse } = require('csv-parse/sync');


async function exportCSV() {

  const file = fs.readFileSync(path.join(__dirname, '..', 'output', 'city_kokyozahyo_area.csv'), 'utf8')
  const raw = parse(file);

  const admins = glob.sync(path.join(__dirname, '..', '/data/admins/**/*.json'));

  const outCSV = []

  for (const admin of admins) {

    const code = admin.split('/').pop().split('.json').shift()
    const item = raw.find((item) => {
      return item[0] === code
    })

    // 北方領土のコードは、法務省登記所備付地図データには存在しないのでスキップ
    if (!item || item === undefined) {
      console.log(`Not found: ${code}`)
      continue
    }
    outCSV.push(item)
  }

  const csvWriter = createArrayCsvWriter({
    header: ['code','kokyozahyo_area'],
    path: "./output/city_kokyozahyo_area_filtered.csv",
  })

  csvWriter.writeRecords(outCSV)
}

exportCSV()
