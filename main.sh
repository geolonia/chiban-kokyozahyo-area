#!/bin/bash

cat urls-test.txt | while read url
do
  wget -P zips $url
done

find ./zips -name '*.zip' | xargs -P 0 -I '{}' unzip '{}' -d ./all_zips
find ./all_zips -name '*.zip' | parallel 'zipgrep -l "<座標系>任意座標系</座標系>"' > ninni_zahyou.txt
# VScodeで .xml を .zip に置換
mkdir ignore
cat ninni_zahyou.txt | xargs -I '{}' mv ./all_zips/'{}' ./ignore/

