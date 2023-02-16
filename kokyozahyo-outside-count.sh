#!/usr/bin/env bash
set -ex

for i in {1..47}
do
  num=$(printf "%02d" $i)
  echo node kokyozahyo-outside-count.js $num
done | parallel

TARGET_DIR=output

# *_all_kyokyozahyo_outside_files.csv を結合する
ALL_OUTSIDE_FILE=$TARGET_DIR/all_kokyozahyo_outside.csv
CSV_HEADER_OUTSIDE="code,zip_file,市区町村名,地番"

cat $TARGET_DIR/*_all_kyokyozahyo_outside_files.csv > $ALL_OUTSIDE_FILE
sed -i "" "s/$CSV_HEADER_OUTSIDE//" $ALL_OUTSIDE_FILE
sed -i "" "/^$/d" $ALL_OUTSIDE_FILE
find . -name "*_all_kyokyozahyo_outside_files.csv" | xargs rm
sed -i "" "1s/^/$CSV_HEADER_OUTSIDE\n/" $ALL_OUTSIDE_FILE

# *_pref_kyokyozahyo_outside_files.csv を結合する
PREF_COUNT_FILE=$TARGET_DIR/pref_kokyozahyo_outside.csv
CSV_HEADER_COUNT="code,kokyozahyo_total,kokyozahyo_outside"

cat $TARGET_DIR/*_pref_kokyozahyo_outside.csv > $PREF_COUNT_FILE
sed -i "" "s/$CSV_HEADER_COUNT//" $PREF_COUNT_FILE
sed -i "" "/^$/d" $PREF_COUNT_FILE
find . -name "*_pref_kokyozahyo_outside.csv" | xargs rm
sed -i "" "1s/^/$CSV_HEADER_COUNT\n/" $PREF_COUNT_FILE

# *_city_kyokyozahyo_outside_files.csv を結合する
CITY_COUNT_FILE=$TARGET_DIR/city_kokyozahyo_outside.csv
CSV_HEADER_COUNT="code,kokyozahyo_total,kokyozahyo_outside"

cat $TARGET_DIR/*_city_kokyozahyo_outside.csv > $CITY_COUNT_FILE
sed -i "" "s/$CSV_HEADER_COUNT//" $CITY_COUNT_FILE
sed -i "" "/^$/d" $CITY_COUNT_FILE
find . -name "*_city_kokyozahyo_outside.csv" | xargs rm
sed -i "" "1s/^/$CSV_HEADER_COUNT\n/" $CITY_COUNT_FILE