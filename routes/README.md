
- [End points](#end-points)
  * [Crawler](#crawler)
    + [`/crawler/init/allrecipes`](#crawlerinitallrecipes)
    + [`/crawler/update/allrecipes`](#crawlerupdateallrecipes)
    + [`/crawler/index`](#crawlerindex)
    + [`/crawler/index/drop`](#crawlerindexdrop)
  * [Recipes](#recipes)
    + [`/recipes`](#recipes-1)
    + [`/recipes/drop`](#recipesdrop)
    + [`/recipes/search`](#recipessearch)
    + [`/recipes/user/search`](#recipesusersearch)
  * [Users](#users)
    + [`/users`](#users-1)
    + [`/users/create`](#userscreate)
    + [`/users/delete`](#usersdelete)
    + [`/users/edit`](#usersedit)
    + [`/users/ingredients/add`](#usersingredientsadd)
    + [`/users/ingredients/remove`](#usersingredientsremove)
    + [`/users/filtered/dishes/add`](#usersfiltereddishesadd)
    + [`/users/filtered/dishes/remove`](#usersfiltereddishesremove)

# End points

## Crawler

### `/crawler/init/allrecipes`

Method: `POST`\
Input: {beginIndex: \<integer>, endIndex: \<integer>} in request body\
Description: Start crawling from allRecipes.com from `beginIndex` to `endIndex`.

### `/crawler/update/allrecipes`

Method: `POST`\
Input: {continueErrorCount: \<integer>} in request body\
Description: Start updating from allRecipes.com and it will not stop until it hits `continueErrorCount` number of error continuesly.

### `/crawler/index`

Method: `GET`\
Input: none\
Description: Get the last visited index for all the provider. These indexes is used to know where to start updating.

### `/crawler/index/drop`

Method: `POST`\
Input: none\
Description: Remove all the crawler indexes.

## Recipes

### `/recipes`

Method: `GET`\
Input: none\
Description: Randomly output a recipe.

### `/recipes/drop`

Method: `POST`\
Input: none\
Description: Delete all recipes in database.

### `/recipes/search`

Method: `GET`\
Input: `?terms=term1+term2+...&page=<page number>&limit=<items per page>` in request query\
Description: Search database with items that include the terms and ordered by score(recipes that matchs more terms will have a higher score).

### `/recipes/user/search`

Method: `GET`\
Input: `?page=<page number: integer>&limit=<items per page: integer>&userId=<userId: string>&minRating=<integer from 1-10>&xxx[value]=<integer>&xxx[strategy]=<at most|least: string>` in request query\
Description: Search database with items that include the terms, match user goal, and ordered by score(recipes that matchs more terms will have a higher score).

`xxx` can be one/many of the following:
[
"calories"
"proteinContent"
"sugarContent"
"sodiumContent"
"fatContent"
"fiberContent"
"carbohydrateContent"
"cholesterolContent"
]

## Users

### `/users`

Method: `GET`\
Input: none\
Description: Return all the existing users.

### `/users/create`

Method: `PUT`\
Input: `user` in request body\
Description: Creates a new user. See [newUser.json](../libs/schema/newUser.json).

### `/users/delete`

Method: `DELETE`\
Input: `id` in request body\
Description: Deletes a user by id.

### `/users/edit`

Method: `PUT`\
Input: `user` and `id` in request body\
Description: Update an existing user. See [editUser.json](../libs/schema/editUser.json).

### `/users/ingredients/add`

Method: `PUT`\
Input: `userId`(string) and `ingredients`(array of string) in request body\
Description: Add `ingredients` to the user with `userId`. Ignores ingredients that is already present in user's ingredients

### `/users/ingredients/remove`

Method: `PUT`\
Input: `userId`(string) and `ingredients`(array of string) in request body\
Description: Remove `ingredients` from the user with `userId`.

### `/users/filtered/dishes/add`

Method: `PUT`\
Input: `userId`(string) and `dishes`(array of string) in request body\
Description: Add `dishes` to the user with `userId` such that everything in `dishes` will be filtered out during search.

### `/users/filtered/dishes/remove`

Method: `PUT`\
Input: `userId`(string) and `dishes`(array of string) in request body\
Description: Remove `dishes` from the user with `userId`.