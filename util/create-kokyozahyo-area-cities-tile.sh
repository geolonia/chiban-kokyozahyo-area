#!/usr/bin/env bash
set -e

# もし chiban-cities.mbtiles があれば削除する

if [ -f chiban-cities.mbtiles ]; then
  rm chiban-cities.mbtiles
fi

bash ./util/create-cities-tile.sh
rm chiban-cities.mbtiles

if [ -f chiban-kokyozahyo-area-cities.temp.mbtiles ]; then
  rm chiban-kokyozahyo-area-cities.temp.mbtiles
fi

tile-join -o chiban-kokyozahyo-area-cities.temp.mbtiles -c output_kokyozahyo/city_kokyozahyo_area.csv chiban-cities.mbtiles
rm chiban-kokyozahyo-area-cities.temp.mbtiles

if [ -f chiban-kokyozahyo-area-cities.mbtiles ]; then
  rm chiban-kokyozahyo-area-cities.mbtiles
fi

tile-join -o chiban-kokyozahyo-area-cities.mbtiles -c output_admins/city_admins_area.csv chiban-kokyozahyo-area-cities.temp.mbtiles

