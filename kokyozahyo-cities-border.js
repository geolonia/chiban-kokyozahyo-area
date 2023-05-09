#!/usr/bin/env node

const xml2geojson = require("./util/xml2geojson")
const fs = require("fs")


const xml = fs.readFileSync("./all_zips/30422-1704-3.xml", "utf8")
const geojson = xml2geojson(xml)
console.log(JSON.stringify(geojson, null, 2))
