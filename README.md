# 登記所備付地図データ公共座標件数と面積の計算方法について

## 【概要】

このドキュメントでは、法務省の登記所備付地図データを元に作成した、公共座標整理状況マップ（https://geolonia.github.io/chiban-zahyo-map） で可視化しているデータの計算方法とデータソースについて説明します。

## 【計算式】

### 公共座標の筆の件数

```
数字で始まる地番の件数 = (登記所備付地図データの地番住所総数) - (数字で以外で始まる地番の件数)
公共座標の件数 =  （数字で始まる地番の件数）- （任意座標の地番の件数）
公共座標の比率 =  (公共座標の件数 / 数字で始まる地番の件数) * 100
任意座標の比率 =  (任意座標の件数 / 数字で始まる地番の件数) * 100
```
- 公共座標のzipファイル名を取得する手順（https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c）
- 集計に使用したスクリプト（https://github.com/geolonia/moj-counts）
- 公共座標と任意座標の比率は、[Math.round](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/round) を使用して四捨五入して整数として表示しています。

### 公共座標の筆の面積

#### 1.公共座標の筆の面積の計算方法

1. 登記所備付地図データの地番住所から、任意座標のデータを除外。
1. 公共座標の筆データから、数字で始まる地番を持つ筆データを除外。
1. ndgeojson というデータ形式に変換し、[Turf.js の area](https://turfjs.org/docs/#area) メソッドで筆毎の面積を計算。
1. 都道府県、市区町村毎に `3.` で計算した面積を合算する。

- [Turf.js の area](https://turfjs.org/docs/#area) メソッドは計算結果に[誤差](https://github.com/Turfjs/turf/issues/1366)があるため、面積の数値は**概算**です。
- 地図で表示している値は、計算した結果を平方メートルから、平方キロメートルに変換し、[Math.round](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/round) を使用して四捨五入して整数として表示しています。
- 使用したスクリプトは本リポジトリの([kokyozahyo-area-calc.js](https://github.com/geolonia/chiban-kokyozahyo-area/blob/main/kokyozahyo-area-calc.js)と、[kokyozahyo-area-calc.sh](https://github.com/geolonia/chiban-kokyozahyo-area/blob/main/kokyozahyo-area-calc.sh))をご参照ください。

#### 2. 公共座標の筆の面積比率の計算方法

```
公共座標の筆の面積比率 = （（公共座標の筆データの総面積）/ （自治体の面積））* 100
```

- 自治体の面積は、[国土地理院の「全国都道府県市区町村別面積調」](https://www.gsi.go.jp/KOKUJYOHO/OLD-MENCHO-title.htm)の値を使用しています。
- 公共座標と任意座標の比率は、[Math.round](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/round) を使用して四捨五入して整数として表示しています。
- 公共座標の筆データの総面積、自治体の面積(全国都道府県市区町村別面積調)共に概算数値のため、公共座標の筆の面積比率も**概算**の数値です。


## 【データーソース】
