/* global document */

module.exports = async function processPage(url, baseUrl, page, log) {
  const requests = [];

  const pageObject = {
    url,
  };

  if (log) {
    console.log(`${url}:`);
  }

  await page.setRequestInterception(true);

  page.on('request', interceptedRequest => {
    requests.push(interceptedRequest);
    interceptedRequest.continue();
  });

  await page.goto(url);

  pageObject.httpRequests = requests.filter(request => request.url().match(/^http:\/\//));

  if (log) {
    const { httpRequests } = pageObject;
    console.log(`${httpRequests.length} HTTP requests made.`);
    if (httpRequests.length) {
      httpRequests.forEach(console.log);
    }
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
