#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync')

const file = fs.readFileSync(path.join(__dirname, '../output/geojson-cluster.csv'), 'utf8')
const csv = parse(file, { skip_empty_lines: true });

const exportRepresentPointGeojson = (csv, zips_dir) => {

  let debug;

  for (let i = 0; i < csv.length; i++) {

    if (i === 0) continue // skip header (column names
    
    const row = csv[i]
    const basename = row[0].split('.')[0]
    const filePath = path.join(__dirname, zips_dir, basename + '.ndgeojson')

    const raw  = fs.readFileSync(filePath, 'utf8')
    const features = raw.split('\n')
    debug = features
  }

  return debug

}


// exportRepresentPointGeojson(csv, '../../all_zips')





// for (const row of csv) {

//   const basename = row[0]
//   const filePath = path.join(__dirname, '../../all_zips', basename + '.ndgeojson')

//   if (!fs.existsSync(filePath)) {
//     console.error('File not found: ' + filePath)
//     process.exit(1)
//   }

//   const ndgeojson = fs.readFileSync(filePath, 'utf8')
//   const json = JSON.parse(ndgeojson)


//   console.log(json)


// }

module.exports = {
  exportRepresentPointGeojson,
}