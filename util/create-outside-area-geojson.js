#!/usr/bin/env node
const fs = require('fs');
const path = require('path')
const { parse } = require('csv-parse/sync')

// const targetPath = path.join(__dirname, '../output/all_kokyozahyo_outside.csv')
const targetPath = path.join(__dirname, '../test/all_kokyozahyo_outside.csv')

let brokenNdgeojson = ''

if (!fs.existsSync(targetPath)) {
  console.error('File not found: ' + targetPath)
  process.exit(1)
}

const file = fs.readFileSync(targetPath, 'utf-8');
const csv = parse(file, { columns: true, skip_empty_lines: true });

for (const row of csv) {
  const { zip_file } = row

  const basename = path.basename(zip_file, '.zip')
  // const ndgeojson = path.join(__dirname, '../../all_zips', basename + '.ndgeojson')
  const filePath = path.join(__dirname, '../test', basename + '.ndgeojson')
  const raw = fs.readFileSync(filePath, 'utf-8')
  brokenNdgeojson += raw
}

fs.writeFileSync(path.join(__dirname, '../test/outside-area.ndgeojson'), brokenNdgeojson)