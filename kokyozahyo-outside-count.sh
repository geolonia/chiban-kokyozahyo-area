#!/usr/bin/env bash
set -ex

for i in {1..47}
do
  num=$(printf "%02d" $i)
  echo node kokyozahyo-outside-count.js $num
done | parallel

TARGET_DIR=output

# mac だと $SED_OPTION にする、linux の場合は、-i だけでいい
# SED_OPTION="-i"

# if [ "$(uname)" == 'Darwin' ]; then
#   SED_OPTION="-i \"\""
# fi

# *_all_kyokyozahyo_outside_files.csv を結合する
# ALL_OUTSIDE_FILE=$TARGET_DIR/all_kokyozahyo_outside.csv
# CSV_HEADER_OUTSIDE="zip_file,chiban"

# cat $TARGET_DIR/*_all_kyokyozahyo_outside_files.csv > $ALL_OUTSIDE_FILE
# sed $SED_OPTION "s/$CSV_HEADER_OUTSIDE//" $ALL_OUTSIDE_FILE
# sed $SED_OPTION "/^$/d" $ALL_OUTSIDE_FILE
# find . -name "*_all_kyokyozahyo_outside_files.csv" | xargs rm
# sed $SED_OPTION "1s/^/$CSV_HEADER_OUTSIDE\n/" $ALL_OUTSIDE_FILE