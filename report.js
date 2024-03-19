function printReport(pages){
    console.log("===============")
    console.log("REPORT")
    console.log("===============")
    const sortedPages = sortPages(pages)
    for( const sortedPage of sortedPages){
        const url = sortedPage[0]
        const hits = sortedPage[1]
        console.log(`Found ${hits} links to page: ${url}`)
    }
    console.log("===============")
    console.log("END REPORT")
    console.log("===============")
    console.log("MAKE SURE TO UPDATE CSS HREFS FOR VIEWING LOCALLY")
    console.log("===============")
    console.log("IMAGE URLs ARE SAVE INSIDE A FILE. FILE PATHS FOR LINKS AND DOWNLOADED PHOTOS WIP.")
    console.log("===============")
}


function sortPages(pages){
   const pagesArr = Object.entries(pages)
   pagesArr.sort((a,b) => {
        var aHits = a[1]
        var bHits = b[1]
        return b[1] - a[1]
        //greatest to least, swap for opposite
   })
   return pagesArr
}

module.exports = {
    sortPages,
    printReport
}