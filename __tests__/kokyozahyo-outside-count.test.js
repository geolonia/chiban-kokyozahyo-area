const fs = require('fs');
const { 
  getCityData,
  get筆Features,
  is筆InsideCity,
  inspectOutside筆ByAreaRate
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

describe('is筆InsideCity', () => {

  test('完全に市区町村外の筆をテスト', () => {
    const { outsideNdGeoJsons } = is筆InsideCity("07", "__tests__/data")
    expect(outsideNdGeoJsons).toContain("__tests__/data/07201-3800-546.ndgeojson")
  });

  test('完全に市区町村内の筆をテスト', () => {
    const { outsideNdGeoJsons } = is筆InsideCity("07", "__tests__/data")
    expect(outsideNdGeoJsons).not.toContain("__tests__/data/07201-3800-613.ndgeojson")
  });

  // https://geolonia.github.io/chiban-kokyozahyo-area/outside-fude#14.67/36.0241/139.78381
  test('市区町村外の筆をテスト', () => {
    const { outsideNdGeoJsons } = is筆InsideCity("11", "__tests__/data")
    expect(outsideNdGeoJsons).not.toContain("__tests__/data/11214-0315-96.ndgeojson")
  });
});

describe('inspectOutside筆ByAreaRate', () => {

  test('完全に市区町村外の筆をテスト', () => {
    const prefCode = "07"
    const { outsideNdGeoJsons } = is筆InsideCity(prefCode, "__tests__/data")
    const { outsideFiles } = inspectOutside筆ByAreaRate(prefCode, outsideNdGeoJsons)
    expect(outsideFiles).toContain("07201-3800-546.zip")
  });

  test('完全に市区町村内の筆をテスト', () => {
    const prefCode = "07"
    const { outsideNdGeoJsons } = is筆InsideCity(prefCode, "__tests__/data")
    const { outsideFiles } = inspectOutside筆ByAreaRate(prefCode, outsideNdGeoJsons)
    expect(outsideFiles).not.toContain("07201-3800-613.zip")
  });


  //TODO:以下のテストを書く

  // 市区町村と重なっている筆の内、市区町村外の箇所が5%以上の筆をテスト

  // 市区町村と重なっている筆の内、市区町村外の箇所が5%未満の筆をテスト

});
