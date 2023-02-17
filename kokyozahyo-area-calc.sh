#!/usr/bin/env bash
set -ex

if [ ! -d output ]; then
  mkdir output
else
  rm -f output/*_city_kokyozahyo_area.csv
  rm -f output/*_pref_kokyozahyo_area.csv 
fi

for i in {1..47}
do
  num=$(printf "%02d" $i)
  echo node kokyozahyo-area-calc.js $num
done | parallel

TARGET_DIR=output
CSV_HEADER="code,kokyozahyo_area"

# mac だと -i "" にする、linux の場合は、-i だけでいい
SED_OPTION="-i"

if [ "$(uname)" == 'Darwin' ]; then
  SED_OPTION="-i \"\""
fi

# *_pref_kyokyozahyo_outside_files.csv を結合する
PREF_COUNT_FILE=$TARGET_DIR/pref_kokyozahyo_area.csv

cat $TARGET_DIR/*_pref_kokyozahyo_area.csv > $PREF_COUNT_FILE
sed $SED_OPTION "s/$CSV_HEADER//" $PREF_COUNT_FILE
sed $SED_OPTION "/^$/d" $PREF_COUNT_FILE
find . -name "*_pref_kokyozahyo_area.csv" | xargs rm
sed $SED_OPTION "1s/^/$CSV_HEADER\n/" $PREF_COUNT_FILE

# *_city_kyokyozahyo_outside_files.csv を結合する
CITY_COUNT_FILE=$TARGET_DIR/city_kokyozahyo_area.csv

cat $TARGET_DIR/*_city_kokyozahyo_area.csv > $CITY_COUNT_FILE
sed $SED_OPTION "s/$CSV_HEADER//" $CITY_COUNT_FILE
sed $SED_OPTION "/^$/d" $CITY_COUNT_FILE
find . -name "*_city_kokyozahyo_area.csv" | xargs rm
sed $SED_OPTION "1s/^/$CSV_HEADER\n/" $CITY_COUNT_FILE

rm -f output/*_city_kokyozahyo_area.csv
rm -f output/*_pref_kokyozahyo_area.csv