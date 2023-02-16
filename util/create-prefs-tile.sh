#!/usr/bin/env bash
set -e

OUTPUT_FILE="chiban-prefs.mbtiles"
tippecanoe_args="-zg --force"
tippecanoe ${tippecanoe_args} -o ${OUTPUT_FILE} -l admins ./data/prefectures.geojson