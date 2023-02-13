const glob = require("glob")
const fs = require("fs")
const turf = require("@turf/turf")
const path = require("path")
const cityTotals = {}
const prefTotals = {}

glob.sync("./all_zips/*.geojson").forEach(file => {

  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);

  const basename = path.basename(file, ".geojson")
  const code = basename.split("-")[0]
  const prefCode = code.slice(0, 2)

  for (const feature of data.features) {

    if (!feature.properties.地番.match(/^[0-9]/)) {
      continue;
    }
    
    const area = turf.area(feature) // in square meters

    if (!prefTotals[prefCode]) {
      prefTotals[prefCode] = 0
    }
    prefTotals[prefCode] += area

    if (!cityTotals[code]) {
      cityTotals[code] = 0
    }
    cityTotals[code] += area
  }
})

for (const [code, area] of Object.entries(prefTotals)) {
  console.log(`${code},${area}`)
}

for (const [code, area] of Object.entries(cityTotals)) {
  console.log(`${code},${area}`)
}