#!/bin/bash -e

layer_name=$(basename "$1" .ndgeojson)
ogr2ogr -f geojsonseq /vsistdout/ "$1" -sql "select st_convexhull(st_collect(geometry)) as geometry, \"市区町村コード\",
\"zip_file\", \"outside_area_rate\", \"市区町村名\", \"大字コード\", \"丁目コード\", \"小字コード\", \"大字名\", \"丁目名\", \"小字名\" from \"$layer_name\" GROUP BY '1'" -dialect sqlite