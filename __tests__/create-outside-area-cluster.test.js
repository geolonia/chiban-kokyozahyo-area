const fs = require('fs');
const {
  exportRepresentPointGeojson,
} = require('../util/create-outside-area-cluster'); // your_functions_file.js は実際のファイル名に置き換えてください。

describe('getCityData', () => {
  test('正常なデータを返すこと', () => {

    const csv = [
      ['xml_file','outside_area_rate'],
      ['01101-4300-49', '']
    ]

    const ndegeojson = exportRepresentPointGeojson(csv, '../__tests__/data')
    console.log(ndegeojson)

    // expect(cityName).toEqual("兵庫県神戸市西区")
  });
});