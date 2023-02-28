#!/usr/bin/env bash
set -e

# 絶対パスを取得
SCRIPT_DIR=$(cd $(dirname $0); pwd)
BASE_DIR=$(cd ${SCRIPT_DIR}/..; pwd)

INPUT_FILE="${BASE_DIR}/output/outside-area.ndgeojson"
OUTPUT_FILE="${BASE_DIR}/outside-area-files.mbtiles"

find $BASE_DIR -name 'outside-area.ndgeojson' -print0 | parallel -0 -j 16 --line-buffer jq -cr -f $SCRIPT_DIR/polygon_filter_script.jq '{}' > ./all_polygons.ndgeojson

# --temporary-directoryオプションでマウントしたディレクトリに一時ファイルを作成する。
# でないとディスク容量不足で失敗する。
# tippecanoe_args="-Z 7 -z 20 --force -P --temporary-directory=${BASE_DIR} --drop-densest-as-needed -x 筆ID -x version -x 測地系判別 -x 地図名 -x 地図番号 -x 縮尺分母 -x 大字コード -x 丁目コード -x 小字コード -x 予備コード -x 大字名 -x 丁目名 -x 小字名 -x 予備名 -x 精度区分 -x 座標値種別 -x 図上測量 -x 筆界未定構成筆"

# tippecanoe ${tippecanoe_args} -o ${OUTPUT_FILE} -l outside-area $INPUT_FILE