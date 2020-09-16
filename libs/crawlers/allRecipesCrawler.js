const request = require('request');
const URL = require('url-parse');
const path = require('path')
const fs = require('fs')

const baseUrl = "https://www.allrecipes.com/recipe/"

const minIndex = 35118
const maxIndex = 300000

const startCrawling = async (callback) => {
    for (let index = minIndex; index <= maxIndex; index++) {
        const currentUrl = baseUrl + index
        
        request(currentUrl, function (error, response, body) {
            if (error) {
                console.error('error:', error); // Print the error if one occurred
            }

            console.log("currentIndex = "+ index)
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

            if (response && response.statusCode == 200) {
                const filePath = path.join(__dirname, "result", 'allRecipes' + index + ".txt");
                console.log(filePath)
                fs.writeFile(filePath, body, (err) => {
                    if (err) throw err;
                    console.log('The file has been saved!');
                });
            }

        });
        await sleep(2000)
    }
    return callback()
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 

module.exports = {
    startCrawling
}