async function saveHTML(pages){
    console.log("===============")
    console.log("SAVING HTML")
    console.log("===============")
    for( const page of Object.entries(pages)){
        const url = page[0]
        const hits = page[1]
        console.log(`Saved ${url} html`)
    }
    console.log("===============")
    console.log("HTML SAVED")
    console.log("===============")
}

module.exports = {
    saveHTML
}