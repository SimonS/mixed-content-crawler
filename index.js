const processPage = require('./lib/processPage');

const puppeteer = require('puppeteer');
const parseArgs = require('minimist');

const argv = parseArgs(process.argv.slice(2));
if (!argv._.length) {
  console.log('Usage: node index.js <baseUrl>');
  process.exit(1);
}

const baseUrl = argv._.pop();

// a lot of hacky asyncs in there
process.on('uncaughtException', console.log);

puppeteer.launch().then(async browser => {
  // need to work out how best to parallelise this (multiple pages? browsers? node processes?)
  // in the meantime, just keep it simple, we can batch this stuff.
  const crawled = new Set();
  let toCrawl = new Set([baseUrl]);

  const difference = (a, b) => new Set([...a].filter(x => !b.has(x)));
  const union = (a, b) => new Set([...a, ...b]);

  while (toCrawl.size) {
    const url = toCrawl.values().next().value;
    const pageObject = await processPage(url, baseUrl, browser, true);
    crawled.add(url);
    toCrawl = union(difference(pageObject.uniqueLinks, crawled), toCrawl);
  }
  await browser.close();
});
