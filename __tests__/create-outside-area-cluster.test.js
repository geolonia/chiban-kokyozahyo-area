const fs = require('fs');
const {
  exportRepresentPointGeojson,
} = require('../util/create-outside-area-cluster');

describe('getCityData', () => {
  test('ポリゴンから重心の GeoJSON を作成する', () => {

    const csv = [
      ['xml_file','outside_area_rate'],
      ['01101-4300-49', '']
    ]

    const geojson = exportRepresentPointGeojson(csv, '../__tests__/data')
    expect(geojson.features[0].geometry.coordinates).toEqual([141.3077950650103,43.06041850133848])  
  });
});