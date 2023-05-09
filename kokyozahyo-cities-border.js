#!/usr/bin/env node

const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');
const glob = require("glob")
const getCityBorders = require("./util/xml2geojson")

const directoryPath = './all_zips/30422-1704';

const unzip = (directoryPath) => {

  fs.readdir(directoryPath, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
      const filePath = path.join(directoryPath, file);

      if (path.extname(file) === '.zip') {
        fs.createReadStream(filePath)
          .pipe(unzipper.Parse())
          .on('entry', function (entry) {

            if (path.extname(entry.path) === '.xml') {
              const targetPath = path.join(directoryPath, path.basename(entry.path));
              entry.pipe(fs.createWriteStream(targetPath));

            } else {
              entry.autodrain();
            }
          });
      }
    });
  });
}

const xml2geojson = (directoryPath) => {

  const files = glob.sync(`${directoryPath}/*.xml`)

  const geojson = {
    type: "FeatureCollection",
    features: []
  }

  for (let i = 0; i < files.length; i++) {

    const file = files[i];

    console.log(`Processing ${file} ${i + 1}/${files.length}`);

    const xmlString = fs.readFileSync(file, 'utf8');
    const features = getCityBorders(xmlString);
    geojson.features = geojson.features.concat(features)
  }

  const targetPath = path.join(directoryPath, 'cityBorders.geojson');

  fs.writeFileSync(targetPath, JSON.stringify(geojson));

  console.log(`Done!`);
}

unzip(directoryPath)
xml2geojson(directoryPath)