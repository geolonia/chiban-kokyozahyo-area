#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const path = require("path")
const turf = require("@turf/turf")
const cityTotals = {}

glob.sync("./admins/*/*.json").forEach((file, index) => {

  const raw = fs.readFileSync(file, "utf8")
  const data = JSON.parse(raw)
  const code = path.basename(file, ".json")
  const prefCode = code.slice(0, 2)

  for (const feature of data.features) {
    const area = turf.area(feature) // in square meters

    if (!cityTotals[code]) {
      cityTotals[code] = 0
    }

    cityTotals[code] += area
  }

})

for (const [code, area] of Object.entries(cityTotals)) {
  console.log(code, area)
}