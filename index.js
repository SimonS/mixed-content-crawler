const processPage = require('./lib/processPage');

const puppeteer = require('puppeteer');
const parseArgs = require('minimist');

const argv = parseArgs(process.argv.slice(2));
if (!argv._.length) {
  console.log('Usage: node index.js <baseUrl>');
  process.exit(1);
}

const baseUrl = argv._.pop();

puppeteer.launch().then(async browser => {
  // need to work out how best to parallelise this (multiple pages? browsers? node processes?)
  // in the meantime, just keep it simple, we can batch this stuff.
  const page = await browser.newPage();
  await processPage(baseUrl, baseUrl, page, true);

  await browser.close();
});
