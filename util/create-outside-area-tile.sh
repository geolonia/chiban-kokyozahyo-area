#!/usr/bin/env bash
set -e

# 絶対パスを取得
SCRIPT_DIR=$(cd $(dirname $0); pwd)
INPUT_FILE="${SCRIPT_DIR}/../test/outside-area.ndgeojson"
OUTPUT_FILE="${SCRIPT_DIR}/../outside-area-files.mbtiles"
tippecanoe_args="-zg --force -P"

tippecanoe ${tippecanoe_args} -o ${OUTPUT_FILE} -l outside-area $INPUT_FILE