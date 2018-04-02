/* global document */
const chalk = require('chalk');
const ora = require('ora');

function logResult(pageObject, spinner) {
  const { httpRequests, url } = pageObject;
  const styledUrl = httpRequests.length ? chalk.red.bold(url) : chalk.green.bold(url);
  const reqString = `${styledUrl} - 
    ${httpRequests.length}/${pageObject.reqCount} HTTP requests made.`;

  if (httpRequests.length) {
    spinner.fail(reqString);
  } else {
    spinner.succeed(reqString);
  }

  if (httpRequests.length) {
    httpRequests.forEach(req => ora().warn(`HTTP request fired: ${chalk.bold.yellow(req.url())}`));
  }
}

module.exports = async function processPage(url, baseUrl, browser, log) {
  const requests = [];
  const page = await browser.newPage();

  const pageObject = {
    url,
    reqCount: 0,
  };
  let spinner;

  if (log) {
    spinner = ora(`${url}`).start();
  }

  await page.setRequestInterception(true);

  page.on('request', interceptedRequest => {
    requests.push(interceptedRequest);
    pageObject.reqCount += 1;

    interceptedRequest.continue();
  });

  await page.goto(url).catch(console.log);

  pageObject.httpRequests = requests.filter(request => request.url().match(/^http:\/\//));

  if (log) {
    logResult(pageObject, spinner);
  }

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(u => u.href),
  );

  const isSubPage = u => u.match(new RegExp(`^${baseUrl}`));
  const removeTrailingSlash = u => u.replace(/\/$/, '');
  const removeFragment = u => u.split('#')[0];

  pageObject.uniqueLinks = new Set(
    links
      .filter(isSubPage)
      .map(removeTrailingSlash)
      .map(removeFragment),
  );

  return pageObject;
};
