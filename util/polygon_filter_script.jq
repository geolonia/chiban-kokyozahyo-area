if (.properties."地番" | test("^[0-9]")) then
{
  type: .type,
  geometry: .geometry,
  properties: (.properties | {
    "市区町村名",
    "市区町村コード",
    "大字コード",
    "丁目コード",
    "小字コード",
    "予備コード",
    "大字名",
    "丁目名",
    "小字名",
    "予備名",
    "地番"
  } )
}
else
empty
end