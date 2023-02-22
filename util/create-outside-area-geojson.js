#!/usr/bin/env node
const fs = require('fs');
const path = require('path')
const readline = require('node:readline');
const { parse } = require('csv-parse/sync')

const targetPath = path.join(__dirname, '../output/all_kokyozahyo_outside.csv')
// const targetPath = path.join(__dirname, '../test/all_kokyozahyo_outside.csv')

const outputPath = path.join(__dirname, '../output/outside-area.ndgeojson');
// const outputPath = path.join(__dirname, '../test/outside-area.ndgeojson');

async function processLineByLine() {

  if (!fs.existsSync(targetPath)) {
    console.error('File not found: ' + targetPath)
    process.exit(1)
  }

  const file = fs.readFileSync(targetPath, 'utf-8');
  const csv = parse(file, { columns: true, skip_empty_lines: true });
  const streamWrite = fs.createWriteStream(outputPath);

  for (const row of csv) {
    const { zip_file } = row

    const basename = path.basename(zip_file, '.zip')
    const filePath = path.join(__dirname, '../../all_zips', basename + '.ndgeojson')
    // const filePath = path.join(__dirname, '../test', basename + '.ndgeojson')

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      console.log(`Line from file: ${line}`);
      streamWrite.write(line);

    }
  }

  streamWrite.end();
  console.log('done');

}

processLineByLine();