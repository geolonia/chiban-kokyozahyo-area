#!/usr/bin/env bash

set -ex

# 都道府県ごとに実行する
for i in {1..47}
do

  # もし zips ディレクトリがあれば削除
  if [ -e zips ]; then
    rm -rf zips
  fi

  # もし all_zips ディレクトリがあれば削除
  if [ -e all_zips ]; then
    rm -rf all_zips
  fi

  # もし ignore ディレクトリがあれば削除
  if [ -e ignore ]; then
    rm -rf ignore
  fi

  # もし ninni_zahyou.txt があれば削除
  if [ -e ninni_zahyou.txt ]; then
    rm -f ninni_zahyou.txt
  fi

  num=$(printf "%02d" $i)
  echo $num

  #urls.txt の中から donwload/num/ を含む行を抽出して、wget でダウンロード
  cat urls-test.txt | grep "download/$num" | while read url
  do
    echo $url
    wget -P zips $url
  done &

  wait

  find ./zips -name '*.zip' | xargs -P 0 -I '{}' unzip '{}' -d ./all_zips
  find ./all_zips -name '*.zip' | parallel 'zipgrep -l "<座標系>任意座標系</座標系>"' > ninni_zahyou.txt
  sed -i "" 's/.xml/.zip/' ninni_zahyou.txt
  mkdir ignore
  cat ninni_zahyou.txt | xargs -I '{}' mv ./all_zips/'{}' ./ignore/

  # node js の script を実行
  node index.js

done