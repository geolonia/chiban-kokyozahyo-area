const fs = require('fs');
const { 
  getCityData,
  get筆Features,
  inspectOutside筆ByHullPolygon,
  inspectOutside筆ByRealPolygon
} = require('../kokyozahyo-outside-count'); // your_functions_file.js は実際のファイル名に置き換えてください。

describe('getCityData', () => {
  test('正常なデータを返すこと', () => {
    const { cityData } = getCityData("28111")
    const cityName = cityData.features[0].properties.name
    expect(cityName).toBe("兵庫県神戸市西区")
  });

  test('エラーが発生した場合に適切なエラーメッセージを返すこと', () => {
    const { cityData, error, errorMessage } = getCityData("00000")
    expect(error).toBe(true)
    expect(errorMessage).toBe("00/00000.json")
  });
});

describe('get筆Features', () => {
  test('正常な筆のデータを返すこと', () => {
    const 筆features = get筆Features("__tests__/data/28111-1403-120.ndgeojson")
    expect(筆features.length).toBe(1362)
  });
});

describe('inspectOutside筆ByHullPolygon', () => {
  test('外れた筆のファイル名が含まれたリストを返すこと', () => {
    const { outsideNdGeoJsons } = inspectOutside筆ByHullPolygon("28", "__tests__/data")
    expect(outsideNdGeoJsons).toContain("__tests__/data/28111-1403-120.ndgeojson")
  });
});
