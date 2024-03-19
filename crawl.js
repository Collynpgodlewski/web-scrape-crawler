const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const Axios = require('axios');
const download = require('image-downloader');

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
    const htmlBody = await resp.text();
    
    // need conditional to only run once or when another is added.
    function getFiles(){

        const cssURLs = getCSSUrlsFromHTML(htmlBody, baseURL);
        const imageURLs = getImageURLFromHTML(htmlBody, currentURL);
        downloadImages(imageURLs, baseURL);
        getHTMLandCSSFiles(currentURL, htmlBody, cssURLs);
        getCSSPage(cssURLs);
    }

    const nextURLs = getURLsFromHTML(htmlBody, baseURL);

    for (const nextURL of nextURLs) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (err) {
    // console.log(`error in fetch: ${err.message}, on page: ${currentURL}`);
  }
  getFiles()
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
    //   console.log("created file");
    }
  );
  fs.writeFileSync(`${newUrl}/index.html`, htmlBody, (err) => {
    if (err) {
      console.error;
      return;
    }
    // console.log(`saved ${currentURL}'s html`);
  });
}

async function getCSSPage(cssURLs) {
  for (const cssURL of cssURLs) {
    const newCSSUrl = normalizeCSSURL(cssURL);
    // console.log(newCSSUrl[0], newCSSUrl[1]);
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
        //   console.log("created file");
        }
      );
      fs.writeFileSync(`${newCSSUrl[0]}/${newCSSUrl[1]}`, cssData, (err) => {
        if (err) {
          console.error;
          return;
        }
        // console.log(`saved ${currentURL}'s html`);
      });
    } catch (err) {
    //   console.log(err.message);
    }
  }
}

function getImageURLFromHTML(htmlBody, baseURL){
    const imageUrls = [];
    const dom = new JSDOM(htmlBody);
    const imageElements = dom.window.document.querySelectorAll("img");
    for( const imageElement of imageElements){
        const imageUrlObj = new URL(`${baseURL}${imageElement.src}`)
        if(!imageUrls.includes(imageUrlObj.href)){
            imageUrls.push(imageUrlObj.href)
        }
    }
    return imageUrls;
}

async function downloadImages(imageURLs, baseURL){
    const baseUrl = normalizeURL(baseURL);
    const imageUrls = [];
    for(const imageURL of imageURLs){
        // const newImageURL = normalizeImageURL(imageURL, baseURL);
        // console.log( newImageURL[0])
        // console.log(newImageURL);
        // if(newImageURL[0].slice(-2) === "//"){
        //     return newImageURL[0] = newImageURL[0].slice(0, -1)
        // }
        imageUrls.push(imageURL);
        console.log(imageURLs)
        fs.mkdirSync(
                 path.join(__dirname, `${baseUrl}/images/`),
                 { recursive: true },
                 (err) => {
                   if (err) {
                     console.error;
                     return;
                   }
                 //   console.log("created file");
                 }
              );
            //   const normImage = normalizeURL(imageURL);
            //   console.log('no slash');
            //   fs.writeFileSync(`${baseUrl}/images/images.txt`, imageURLs , (err) => {
            //       if (err) {
            //         console.error;
            //         return;
            //       }
            //       // console.log(`saved ${currentURL}'s photos`);
            //     });
        // fs.mkdirSync(
        //     path.join(__dirname, `${newImageURL[0]}/`),
        //     { recursive: true },
        //     (err) => {
        //       if (err) {
        //         console.error;
        //         return;
        //       }
        //     //   console.log("created file");
        //     }
        //   );
        //   console.log(newImageURL[0], newImageURL[1])
        //   if(newImageURL[0].length -1 === '/'){
        //     console.log('yup slash');
        //     fs.writeFileSync(`${newImageURL[0]}${newImageURL[1]}`, imageURL , (err) => {
        //         if (err) {
        //           console.error;
        //           return;
        //         }
        //         // console.log(`saved ${currentURL}'s photos`);
        //       });
        //   } else {
            // console.log('no slash');
            // fs.writeFileSync(`${newImageURL[0]}/${newImageURL[1]}`, imageURL , (err) => {
            //     if (err) {
            //       console.error;
            //       return;
            //     }
            //     // console.log(`saved ${currentURL}'s photos`);
            //   });
        //   }
     
        
}
}

// async function downloadFiles(imageURL, newImageURL){
//     console.log(imageURL, newImageURL)
//         const url = imageURL;
   
//         Axios({
//             url: url,
//             method: 'GET',
//             responseType: 'stream'
//         }).then(res => {
//             res.data.pipe(fs.createWriteStream(`${newImageURL[0]}`))
//             res.data.on("end", () => {
//                 console.log("download complete");
//               });
//         })
//         }


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
//   console.log(cssUrls)
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
        // console.log(`error with relative url: ${err.message}`);
      }
    } else {
      // absolute
      try {
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        // console.log(`error with absolute url: ${err.message}`);
      }
    }
  }
//   console.log(urls)
  return urls;
}

function normalizeImageURL(urlString, baseURL){
    const normedBase = normalizeURL(baseURL);
    const imageUrlObj = new URL(urlString);
    // console.log(imageUrlObj);
    if(imageUrlObj.pathname.includes('http')){
        // console.log('it includes http');
        const splitArea = imageUrlObj.pathname.indexOf('http');
        const newHost = imageUrlObj.pathname.split('http', 1)
        const newPath = imageUrlObj.pathname.slice(splitArea, -1)
        // console.log(splitArea, newPath)
        const newHostPath = normalizeURL(imageUrlObj.origin + newHost);
        // console.log(newHostPath, newPath)
        const returnFileData = [newHostPath, newPath]
        return returnFileData
    } else{
        const imageHostPath = `${imageUrlObj.pathname}`
        // console.log(imageUrlObj, imageHostPath)
        const splitArray = imageHostPath.split("/").slice(1);
        const filePath = splitArray.slice(0, -1);
        const imageFileName = splitArray.slice(-1).pop();
        const joinArray = filePath.join("/");
        // const remakePath = `${imageUrlObj.hostname}` + "/" + joinArray + "/";
        const remakePath = normedBase + '/'+ joinArray + '/';
        const returnFileData = [remakePath, imageFileName];
        // console.log(returnFileData)
        // console.log(remakePath)
        return returnFileData
    }
}

function normalizeCSSURL(urlString) {
  const cssUrlObj = new URL(urlString);
  const cssHostPath = `${cssUrlObj.pathname}`;
  const splitArray = cssHostPath.split("/").slice(1);
  const deleteFile = splitArray.slice(0, -1);
  const filePathName = splitArray.slice(-1).pop();
  const joinArray = deleteFile.join("/");
  const remakePath = `${cssUrlObj.hostname}` + "/" + joinArray + "/";
  const returnFileData = [remakePath, filePathName];
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
