if (.properties."地番" | test("^地区外|別図")) then
{
  type: .type,
  geometry: {
    "type": "Point",
    "coordinates": [.properties["代表点経度"], .properties["代表点緯度"]]
  },
  properties: (.properties | {
    "市区町村名",
    "市区町村コード",
    "大字コード",
    "丁目コード",
    "大字名",
    "丁目名"
  } )
}
else
empty
end