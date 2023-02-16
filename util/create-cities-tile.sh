#!/usr/bin/env bash
set -e

OUTPUT_FILE="chiban-cities.mbtiles"
tippecanoe_args="-zg"
find ./data/admins -name "*.json" -print0 | xargs -0 tippecanoe ${tippecanoe_args} -o ${OUTPUT_FILE} -l data/admins


