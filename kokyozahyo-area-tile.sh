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

if [ -f chiban-prefs.mbtiles ]; then
  rm chiban-prefs.mbtiles
fi

bash ./util/create-prefs-tile.sh

if [ -f chiban-kokyozahyo-area-prefs.temp.mbtiles ]; then
  rm chiban-kokyozahyo-area-prefs.temp.mbtiles
fi

tile-join -o chiban-kokyozahyo-area-prefs.temp.mbtiles -c output/pref_kokyozahyo_area.csv chiban-prefs.mbtiles

if [ -f chiban-kokyozahyo-area-prefs.mbtiles ]; then
  rm chiban-kokyozahyo-area-prefs.mbtiles
fi

tile-join -o chiban-kokyozahyo-area-prefs.mbtiles -c output/pref_admins_area.csv chiban-kokyozahyo-area-prefs.temp.mbtiles


rm chiban-cities.mbtiles
rm chiban-kokyozahyo-area-cities.temp.mbtiles
rm chiban-prefs.mbtiles
rm chiban-kokyozahyo-area-prefs.temp.mbtiles
