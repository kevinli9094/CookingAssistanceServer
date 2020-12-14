import scrapy
from elasticsearch import Elasticsearch

firstTime = True


# How to run spider: scrapy runspider xiachufanRecipeCrawler.py -a dbUrl='mongodb://localhost:27017/' -a dbName='cookingAssistance'
class LinkSpider(scrapy.Spider):
    name = 'xiachufanRecipeCrawler'
    start_urls = [
         'https://www.xiachufang.com/category/?full=1'
     ]

    custom_settings = {
        'AUTOTHROTTLE_ENABLED': True,
        'AUTOTHROTTLE_DEBUG': True,
        'DOWNLOAD_DELAY': 10,
        'FEED_EXPORT_ENCODING' : 'utf-16',
        'USER_AGENT' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:39.0) Gecko/20100101 Firefox/39.0'
    }

    def getIdFromUrl(self, url):
        print(url)
        recipeIdStr= 'recipe/'
        startIndex = url.index(recipeIdStr) + len(recipeIdStr)
        endIndex = len(url) - 1
        return 'xiachufan' + url[startIndex : endIndex]

    # parse the categories page
    def parse(self, response):
        global firstTime
        if firstTime:
            es = Elasticsearch()
            self.es = es
            firstTime = False
        


        # link = response.css('div.cates-list-all a')[0]
        # next_page = link.css('::attr("href")').get()
        # yield response.follow(next_page, self.parseSingelCategory)
        for link in response.css('div.cates-list-all a'):
            next_page = link.css('::attr("href")').get()
            yield response.follow(next_page, self.parseSingelCategory)

    def parseSingelCategory(self, response):
        # recipeLink = response.css('div.recipe>a')[0]
        # recipeUrl = recipeLink.css('::attr("href")').get()

        # exist = self.es.exists(index="chinese_recipes",id=self.getIdFromUrl(recipeUrl))
        # if not exist:
        #     yield response.follow(recipeUrl, self.parseRecipe)
        # next_page = response.css('a.next::attr("href")').get()
        # if next_page:
        #     yield response.follow(next_page, self.parseSingelCategory)
        for recipeLink in response.css('div.recipe>a'):
            recipeUrl = recipeLink.css('::attr("href")').get()
            exist = self.es.exists(index="chinese_recipes",id=self.getIdFromUrl(recipeUrl))
            if not exist:
                yield response.follow(recipeUrl, self.parseRecipe)
        next_page = response.css('a.next::attr("href")').get()
        if next_page:
            yield response.follow(next_page, self.parseSingelCategory)



    def parseRecipe(self, response):
        def stripStr(str):
            return str.strip()
        # Ingredients
        ingredients = []
        temp = ""
        for item in response.css('td'):
            itemClass = item.css('::attr(class)').get()
            if itemClass == "name":
                if len(temp) > 0:
                    ingredients.append(temp)
                linkElement = item.css('a')
                if linkElement:
                    temp = linkElement.css('::text').get().strip()
                else:
                    temp = item.css('::text').get().strip()
            if itemClass == 'unit':
                temp = temp + ' ' + item.css('::text').get().strip()

        # Description
        allDescription = response.css('div.desc::text').getall()
        stripedDescription = map(stripStr, allDescription)
        combinedDescription = "\n".join(stripedDescription)

        # Instructions:
        instructions = []
        for step in response.css('div.steps li'):
            instructions.append({
                "text": "\n".join(map(stripStr, step.css('p::text').getall())),
                "image": step.css('img::attr(src)').get()
            })
        
        valueToInsert = {
            'name': response.css('h1.page-title::text').get().strip(),
            'description': combinedDescription,
            'img': response.css('div.cover.image>img::attr("src")').get(),
            'ingredients': ingredients,
            'originUrl': response.request.url,
            'author' : response.css('a.avatar-link::text').getall()[1].strip(),
            'instructions' : instructions,
            'rating':{
                'value': response.css('div.score>span.number::text').get()
            }
        }

        key = {
            'originUrl': valueToInsert['originUrl']
        }

        originUrl = valueToInsert['originUrl']
        id = self.getIdFromUrl(originUrl)
        # yield valueToInsert

        self.es.index(index='chinese_recipes', body=valueToInsert, id=id)

        # self.recipeDb.update(key, valueToInsert, upsert=True)


