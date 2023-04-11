#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync')
const turf = require('@turf/turf');

const file = fs.readFileSync(path.join(__dirname, '../output/geojson-cluster.csv'), 'utf8')
const csv = parse(file, { skip_empty_lines: true });

const exportRepresentPointGeojson = (csv, zips_dir) => {

  const clusterFeatures = []

  for (let i = 0; i < csv.length; i++) {

    if (i === 0) continue // skip header (column names
    
    const row = csv[i]
    const basename = row[0].split('.')[0]
    const filePath = path.join(__dirname, zips_dir, basename + '.ndgeojson')

    const raw  = fs.readFileSync(filePath, 'utf8')
    const stringFeatures = raw.split('\n').filter((line) => line !== '')
    const features = stringFeatures.map((feature) => {
      return JSON.parse(feature)
    })
    const geojson = turf.featureCollection(features)
    const centroid = turf.centroid(geojson);

    clusterFeatures.push(centroid)
  }

  return turf.featureCollection(clusterFeatures)
}

exportRepresentPointGeojson(csv, '../../all_zips')

module.exports = {
  exportRepresentPointGeojson,
}