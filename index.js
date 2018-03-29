const puppeteer = require('puppeteer');

puppeteer.launch().then(async browser => {
  const requests = [];
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', interceptedRequest => {
    requests.push(interceptedRequest);
    interceptedRequest.continue();
  });

  await page.goto('https://bbc.co.uk/sport');

  const httpRequests = requests.filter(request => request.url().match(/^http:\/\//));
  console.log(httpRequests);

  await browser.close();
});
