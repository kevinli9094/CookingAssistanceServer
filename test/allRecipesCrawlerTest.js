const crawler = require('../libs/crawlers/allRecipesCrawler')

describe('crawler', function () {
    describe('allRecipesCrawler', function () {
        it('should return -1 when the value is not present', function () {
            crawler.startCrawling(() => {
                console.log("done")
            })
        });
    });
});