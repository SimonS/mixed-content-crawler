/* global document */

const puppeteer = require('puppeteer');
const parseArgs = require('minimist');

const argv = parseArgs(process.argv.slice(2));

if (!argv._.length) {
  console.log('Usage: node index.js <baseUrl>');
  process.exit(1);
}

const baseUrl = argv._.pop();

puppeteer.launch().then(async browser => {
  const requests = [];
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', interceptedRequest => {
    requests.push(interceptedRequest);
    interceptedRequest.continue();
  });

  await page.goto(baseUrl);

  const httpRequests = requests.filter(request => request.url().match(/^http:\/\//));
  console.log(httpRequests);

  const isSubPage = url => url.match(new RegExp(`^${baseUrl}`));

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(url => url.href),
  );

  const uniqueLinks = new Set(
    links
      .filter(isSubPage)
      .map(url => url.replace(/\/$/, ''))
      .map(url => url.split('#')[0]),
  );

  console.log(uniqueLinks);

  await browser.close();
});
