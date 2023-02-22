#!/usr/bin/env node
const fs = require('fs');
const path = require('path')
const readline = require('node:readline');
const { parse } = require('csv-parse/sync')

const targetPath = path.join(__dirname, '../output/all_kokyozahyo_outside.csv')
// const targetPath = path.join(__dirname, '../test/all_kokyozahyo_outside.csv')

const outputPath = path.join(__dirname, '../output/outside-area.ndgeojson');
// const outputPath = path.join(__dirname, '../test/outside-area.ndgeojson');

let index = 0;

async function processLineByLine() {

  console.log(`start: ${Date.now()}`);

  if (!fs.existsSync(targetPath)) {
    console.error('File not found: ' + targetPath)
    process.exit(1)
  }

  const file = fs.readFileSync(targetPath, 'utf-8');
  const csv = parse(file, { columns: true, skip_empty_lines: true });
  const streamWrite = fs.createWriteStream(outputPath);

  for (const row of csv) {
    const { zip_file } = row
    console.log(`${index}/${csv.length}: ${zip_file}, ${Date.now()}`)

    const basename = path.basename(zip_file, '.zip')
    const filePath = path.join(__dirname, '../../all_zips', basename + '.ndgeojson')
    // const filePath = path.join(__dirname, '../test', basename + '.ndgeojson')

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      streamWrite.write(`${line}\n`);
    }
    index++;
  }

  streamWrite.end();
  console.log(`done: ${Date.now()}`);

}

processLineByLine();