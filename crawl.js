const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

async function crawlPage(baseURL, currentURL, pages) {
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  const normalizedCurrentURL = normalizeURL(currentURL);
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  pages[normalizedCurrentURL] = 1;

  console.log(`actively crawling ${currentURL}`);

  try {
    const resp = await fetch(currentURL);

    if (resp.status > 399) {
      console.log(
        `error in fetch with status code: ${resp.status} on page: ${currentURL}`
      );
      return pages;
    }

    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(
        `non html response, content type: ${contentType} on page: ${currentURL}`
      );
      return pages;
    }
    // need conditional to only run once or when another is added.
    const htmlBody = await resp.text();

    const cssURLs = getCSSUrlsFromHTML(htmlBody, baseURL);

    getCSSPage(cssURLs);
    getHTMLandCSSFiles(currentURL, htmlBody, cssURLs);

    const nextURLs = getURLsFromHTML(htmlBody, baseURL);

    for (const nextURL of nextURLs) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (err) {
    console.log(`error in fetch: ${err.message}, on page: ${currentURL}`);
  }
  return pages;
}

async function getHTMLandCSSFiles(currentURL, htmlBody) {
  const newUrl = normalizeURL(currentURL);
  //   console.log(cssURLs);
  fs.mkdirSync(
    path.join(__dirname, `${newUrl}`),
    { recursive: true },
    (err) => {
      if (err) {
        console.error;
        return;
      }
      console.log("created file");
    }
  );
  fs.writeFileSync(`${newUrl}/index.html`, htmlBody, (err) => {
    if (err) {
      console.error;
      return;
    }
    console.log(`saved ${currentURL}'s html`);
  });
}

async function getCSSPage(cssURLs) {
  for (const cssURL of cssURLs) {
    const newCSSUrl = normalizeCSSURL(cssURL);
    console.log(newCSSUrl[0], newCSSUrl[1]);
    try {
      const resp = await fetch(cssURL);
      const cssData = await resp.text();
      //   console.log(cssData);
      fs.mkdirSync(
        path.join(__dirname, `${newCSSUrl[0]}`),
        { recursive: true },
        (err) => {
          if (err) {
            console.error;
            return;
          }
          console.log("created file");
        }
      );
      fs.writeFileSync(`${newCSSUrl[0]}/${newCSSUrl[1]}`, cssData, (err) => {
        if (err) {
          console.error;
          return;
        }
        console.log(`saved ${currentURL}'s html`);
      });
    } catch (err) {
      console.log(err.message);
    }
  }
}

function getCSSUrlsFromHTML(htmlBody, baseURL) {
  const cssUrls = [];
  const dom = new JSDOM(htmlBody);
  const cssElements = dom.window.document.querySelectorAll(
    "link[rel='stylesheet']"
  );
  for (const cssElement of cssElements) {
    // console.log(`${baseURL}${cssElement.href}`);
    const cssUrlObj = new URL(`${baseURL}${cssElement.href}`);
    if (!cssUrls.includes(cssUrlObj.href)) {
      cssUrls.push(cssUrlObj.href);
    }
  }
  return cssUrls;
}

function getURLsFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll("a");

  for (const linkElement of linkElements) {
    if (linkElement.href.slice(0, 1) === "/") {
      // relative
      try {
        const urlObj = new URL(`${baseURL}${linkElement.href}`);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with relative url: ${err.message}`);
      }
    } else {
      // absolute
      try {
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with absolute url: ${err.message}`);
      }
    }
  }
  return urls;
}

// function grabCSS(cssUrls) {
//   for (const cssUrl in cssUrls) {
//     console.log(cssUrl);
//   }
//   //   console.log(cssUrls);
// }

function normalizeCSSURL(urlString) {
  const cssUrlObj = new URL(urlString);
  //   console.log(cssUrlObj);
  const cssHostPath = `${cssUrlObj.pathname}`;
  //   console.log(cssHostPath);
  const splitArray = cssHostPath.split("/").slice(1);
  const deleteFile = splitArray.slice(0, -1);
  const filePathName = splitArray.slice(-1).pop();
  const joinArray = deleteFile.join("/");
  const remakePath = `${cssUrlObj.hostname}` + "/" + joinArray + "/";
  const returnFileData = [remakePath, filePathName];
  //   console.log(remakePath, filePathName);
  return returnFileData;
}

function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

module.exports = {
  getURLsFromHTML,
  normalizeURL,
  crawlPage,
};
