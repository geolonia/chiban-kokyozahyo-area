module.exports.updateLatestCityCode = (cityCode) => {

  //NOTE: https://www.j-lis.go.jp/data/open/cnt/3/728/1/091009.pdf
  
  // 幌加内町の市区町村コードを改正後に修正
  if (cityCode == "01439") {
    cityCode = "01472"
  }

  // 幌延町の市区町村コードを改正後に修正
  if (cityCode == "01488") {
    cityCode = "01520"
  }

  return cityCode
}
