#!/usr/bin/env bash
set -e

# 絶対パスを取得
SCRIPT_DIR=$(cd $(dirname $0); pwd)
BASE_DIR=$(cd ${SCRIPT_DIR}/..; pwd)

INPUT_FILE="${BASE_DIR}/output/outside_area.ndgeojson"
OUTPUT_FILE="${BASE_DIR}/outside_area_files.mbtiles"
NDGEOJSON_LIST="${BASE_DIR}/output/outside_area_files.csv"

# unix time を出力
echo "start $(date +%s)"

# csvファイルのヘッダーを削除
sed -i -e '1d' $NDGEOJSON_LIST

sed -i "s/^/\.\.\/all_zips\//" $NDGEOJSON_LIST
sed -i "s/\.zip$/\.ndgeojson/" $NDGEOJSON_LIST

cat $NDGEOJSON_LIST | parallel -j 16 --line-buffer jq -cr -f $SCRIPT_DIR/polygon_filter_script.jq '{}' > ./all_polygons.ndgeojson
cat $NDGEOJSON_LIST | parallel -j 16 --line-buffer ./xml_polygon_generator.sh '{}' > ./xml_polygons.ndgeojson
cat $NDGEOJSON_LIST | parallel -j 16 --line-buffer jq -cr -f $SCRIPT_DIR/point_filter_script.jq '{}' > ./all_points.ndgeojson

mkdir -p $(pwd)/tmp
tippecanoe \
  -z11 -Z0 \
  -r1 --cluster-distance=10 \
  --read-parallel \
  -f -o all_points.mbtiles \
  -t $(pwd)/tmp \
  -l outside-area ./all_points.ndgeojson

# zipポリゴンは z0-13 まで
tippecanoe \
  -z13 -Z0 \
  -pk \
  --drop-smallest-as-needed \
  -pS \
  --detect-shared-borders \
  --read-parallel \
  -f -o xml_polygons.mbtiles \
  -t $(pwd)/tmp \
  -l outside-area ./xml_polygons.ndgeojson

# ポリゴンは z14 - z15 まで
tippecanoe \
  -z15 -B15 -Z14 \
  -pk \
  --drop-smallest-as-needed --drop-fraction-as-needed \
  -pS \
  --full-detail=14 \
  --detect-shared-borders \
  --read-parallel \
  -f -o all_polygons.mbtiles \
  -t $(pwd)/tmp \
  -l outside-area ./all_polygons.ndgeojson

# tile-join -pk -f -o $OUTPUT_FILE ./all_points.mbtiles ./xml_polygons.mbtiles ./all_polygons.mbtiles

echo "end $(date +%s)"
