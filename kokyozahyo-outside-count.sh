#!/usr/bin/env bash
set -ex

# 開始時間を記録
startDate=$(date "+%Y/%m/%d %H:%M:%S")
echo "start: ${startDate}" >> log.txt

for i in {1..47}
do
  num=$(printf "%02d" $i)
  echo node kokyozahyo-outside-count.js $num
done | parallel

endDate=$(date "+%Y/%m/%d %H:%M:%S")
echo "end: ${endDate}" >> log.txt 

# TARGET_DIR=output

# # mac だと $SED_OPTION にする、linux の場合は、-i だけでいい
# SED_OPTION="-i"

# if [ "$(uname)" == 'Darwin' ]; then
#   SED_OPTION="-i \"\""
# fi

# # *_all_kyokyozahyo_outside_files.csv を結合する
# ALL_OUTSIDE_FILE=$TARGET_DIR/all_kokyozahyo_outside.csv
# CSV_HEADER_OUTSIDE="zip_file,chiban"

# cat $TARGET_DIR/*_all_kyokyozahyo_outside_files.csv > $ALL_OUTSIDE_FILE
# sed $SED_OPTION "s/$CSV_HEADER_OUTSIDE//" $ALL_OUTSIDE_FILE
# sed $SED_OPTION "/^$/d" $ALL_OUTSIDE_FILE
# find . -name "*_all_kyokyozahyo_outside_files.csv" | xargs rm
# sed $SED_OPTION "1s/^/$CSV_HEADER_OUTSIDE\n/" $ALL_OUTSIDE_FILE


# # *_error.csv を結合する
# ALL_ERROR_FILE=$TARGET_DIR/error.csv
# CSV_HEADER_ERROR="error_city_code_from_xml_not_found_in_admins"

# cat $TARGET_DIR/*_error.csv > $ALL_ERROR_FILE
# sed $SED_OPTION "s/$CSV_HEADER_ERROR//" $ALL_ERROR_FILE
# sed $SED_OPTION "/^$/d" $ALL_ERROR_FILE
# find . -name "*_error.csv" | xargs rm
# sed $SED_OPTION "1s/^/$CSV_HEADER_ERROR\n/" $ALL_ERROR_FILE

# uniq $ALL_ERROR_FILE > $TARGET_DIR/error-uniq.csv
# rm $ALL_ERROR_FILE
# mv $TARGET_DIR/error-uniq.csv $ALL_ERROR_FILE
