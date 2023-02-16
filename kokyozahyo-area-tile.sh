#!/usr/bin/env bash
set -e

if [ -f chiban-kokyozahyo-area.mbtiles ]; then
  rm chiban-kokyozahyo-area.mbtiles
fi

bash ./util/create-cities-tile.sh

if [ -f chiban-kokyozahyo-area-cities.temp.mbtiles ]; then
  rm chiban-kokyozahyo-area-cities.temp.mbtiles
fi

tile-join -o chiban-kokyozahyo-area-cities.temp.mbtiles -c output/city_kokyozahyo_area.csv chiban-cities.mbtiles

if [ -f chiban-kokyozahyo-area-cities.mbtiles ]; then
  rm chiban-kokyozahyo-area-cities.mbtiles
fi

tile-join -o chiban-kokyozahyo-area-cities.mbtiles -c output/city_admins_area.csv chiban-kokyozahyo-area-cities.temp.mbtiles

rm chiban-cities.mbtiles
rm chiban-kokyozahyo-area-cities.temp.mbtiles
