#!/usr/bin/env bash
set -e

# for file in admins/**/*.json; do
#   code=$(echo $file | sed -e 's/.*\///' -e 's/\.json//')
#   echo $code
#   jq -c '.features[] | .properties.code = "'${code}'"' $file > $file.tmp
#   mv $file.tmp $file
# done

OUTPUT_FILE="chiban-admins.mbtiles"
tippecanoe_args="-zg"
find ./admins -name "*.json" -print0 | xargs -0 tippecanoe ${tippecanoe_args} -o ${OUTPUT_FILE} -l admins
