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

  // https://geolonia.github.io/chiban-kokyozahyo-area/outside-fude.html#16.37/36.008734/139.824596
  test('完全に市区町村外の筆をテスト', () => {
    const { outsideNdGeoJsons } = is筆InsideCity("07", "__tests__/data")
    expect(outsideNdGeoJsons).toContain("__tests__/data/07201-3800-546.ndgeojson")
  });

  // https://geolonia.github.io/chiban-kokyozahyo-area/outside-fude.html#14.25/36.00766/139.8019
  test('完全に市区町村内の筆をテスト', () => {
    const { outsideNdGeoJsons } = is筆InsideCity("07", "__tests__/data")
    expect(outsideNdGeoJsons).not.toContain("__tests__/data/11214-0315-118.ndgeojson")
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
    expect(outsideFiles).not.toContain("11214-0315-118.zip")
  });

  // https://geolonia.github.io/chiban-kokyozahyo-area/outside-fude.html#15.96/36.052106/139.720922
  test('市区町村と重なっている筆の内、市区町村外の面積が5%以上の筆をテスト', () => {
    const prefCode = "11"
    const { outsideNdGeoJsons } = is筆InsideCity(prefCode, "__tests__/data")
    const { outsideFiles } = inspectOutside筆ByAreaRate(prefCode, outsideNdGeoJsons)
    expect(outsideFiles).toContain("11464-0315-77.zip")
  });

  // https://geolonia.github.io/chiban-kokyozahyo-area/outside-fude.html#16.42/35.992103/139.573547
  test('市区町村と重なっている筆の内、市区町村外の箇所が5%未満の筆をテスト', () => {
    const prefCode = "11"
    const { outsideNdGeoJsons } = is筆InsideCity(prefCode, "__tests__/data")
    const { outsideFiles } = inspectOutside筆ByAreaRate(prefCode, outsideNdGeoJsons)
    expect(outsideFiles).not.toContain("11219-0310-117.zip")
  });


});
