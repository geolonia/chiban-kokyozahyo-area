#!/bin/bash -ex

cat ../data/urls.txt | while read url
do
  wget -P zips $url
done

# zip を解凍する
find ./zips -name '*.zip' | xargs -P 0 -I '{}' unzip '{}' -d ./all_zips

# 任意座標のファイル名のリストを作成
find ./all_zips -name '*.zip' | parallel 'zipgrep -l "<座標系>任意座標系</座標系>"' > ninni_zahyou.txt

# 任意座標のファイルを、ignore/ に移動
mkdir ignore
cat ninni_zahyou.txt | xargs -I '{}' mv ./all_zips/'{}' ./ignore/