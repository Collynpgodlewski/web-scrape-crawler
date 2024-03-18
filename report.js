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