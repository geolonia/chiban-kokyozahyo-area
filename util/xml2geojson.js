#!/usr/bin/env node
const {proj4, JP_ZONE_TO_EPSG_MAP} = require("./proj")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const getCityBorders = (xmlString) => {

  const features = []

  const dom = new JSDOM(xmlString);
  const parser = new dom.window.DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const projection = xmlDoc.getElementsByTagName('座標系')[0].textContent || ''
  const name = xmlDoc.getElementsByTagName('地図名')[0].textContent || ''

  const 筆界線s = xmlDoc.getElementsByTagName('筆界線')

  if (! projection || '任意座標系' === projection) {
    return
  }
  
  for (let j = 0; j < 筆界線s.length; j++) {
    const 筆界線 = 筆界線s[j]
    const 線種別 = 筆界線.getElementsByTagName('線種別')[0]

    if ('市区町村界線' !== 線種別.textContent) {
      continue
    }

    const 形状 = 筆界線.getElementsByTagName('形状')[0]
    const idref = 形状.attributes.getNamedItem('idref').value

    if (idref) {
      const line = xmlDoc.getElementById(idref)

      if (line) {

        const points = line.getElementsByTagName('zmn:GM_PointRef.point')
        const coordinates = getCoordinates(xmlDoc, points)

        const feature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates
          },
          properties: {
            // name: `${name} 市区町村界線`,
            idref: idref
          }
        }

        features.push(feature)
      }
    }
  }

  return features
}

const getCoordinates = (dom, nodes) => {
  // @ts-ignore
  const 座標系 = JP_ZONE_TO_EPSG_MAP[dom.getElementsByTagName('座標系')[0].textContent] || 'EPSG:4326'

  if (nodes && 座標系) {
    let coordinates = []

    for (let j = 0; j < nodes.length; j++) {
      // @ts-ignore
      const node = dom.getElementById(nodes[j].attributes.getNamedItem('idref').value)
      if (node) {
        const x = node.getElementsByTagName('zmn:X')[0].textContent
        const y = node.getElementsByTagName('zmn:Y')[0].textContent
        if (座標系) {
          const coordinate = proj4(座標系, 'EPSG:4326', [Number(y), Number(x)]);
          coordinates.push(coordinate)
        }
      }
    }

    return coordinates
  }
}

module.exports = getCityBorders