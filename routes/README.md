- [End points](#end-points)
  * [Crawler](#crawler)
    + [`POST /crawler/init/allrecipes`](#post-crawlerinitallrecipes)
    + [`POST /crawler/update/allrecipes`](#post-crawlerupdateallrecipes)
    + [`GET /crawler/index`](#get-crawlerindex)
    + [`DELETE /crawler/index`](#delete-crawlerindexdrop)
  * [Recipes](#recipes)
    + [`GET /recipes`](#get-recipes)
    + [`DELETE /recipes`](#delete-recipes)
    + [`GET /recipes/search`](#get-recipessearch)
    + [`GET /recipes/user/search`](#get-recipesusersearch)
  * [Users](#users)
    + [`GET /users`](#get-users)
    + [`PUT /users`](#put-users)
    + [`DELETE /users`](#delete-users)
    + [`PUT /users/edit`](#put-usersedit)
    + [`PUT /users/ingredients/add`](#put-usersingredientsadd)
    + [`PUT /users/ingredients/remove`](#put-usersingredientsremove)
    + [`PUT /users/filtered/dishes/add`](#put-usersfiltereddishesadd)
    + [`PUT /users/filtered/dishes/remove`](#put-usersfiltereddishesremove)
    + [`PUT /users/selected/dishes/add`](#put-usersselecteddishesadd)
    + [`PUT /users/selected/dishes/remove`](#put-usersselecteddishesremove)

# End points

## Crawler

### `POST /crawler/init/allrecipes`

Input: {beginIndex: \<integer>, endIndex: \<integer>} in request body\
Description: Start crawling from allRecipes.com from `beginIndex` to `endIndex`.

### `POST /crawler/update/allrecipes`

Input: {continueErrorCount: \<integer>} in request body\
Description: Start updating from allRecipes.com and it will not stop until it hits `continueErrorCount` number of error continuesly.

### `GET /crawler/index`

Input: none\
Description: Get the last visited index for all the provider. These indexes is used to know where to start updating.

### `DELETE /crawler/index`

Input: none\
Description: Remove all the crawler indexes.

## Recipes

### `GET /recipes`

Input: none\
Description: Randomly output a recipe.

### `DELETE /recipes`

Input: none\
Description: Delete all recipes in database.

### `GET /recipes/search`

Input: `?terms=term1+term2+...&page=<page number>&limit=<items per page>` in request query\
Description: Search database with items that include the terms and ordered by score(recipes that matchs more terms will have a higher score).

### `GET /recipes/user/search`

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

### `GET /users`

Input: none\
Description: Return all the existing users.

### `PUT /users`

Input: `user` in request body\
Description: Creates a new user. See [newUser.json](../libs/schema/newUser.json).

### `DELETE /users`

Input: `userId` in request body\
Description: Deletes a user by id.

### `PUT /users/edit`

Input: `user` and `id` in request body\
Description: Update an existing user. See [editUser.json](../libs/schema/editUser.json).

### `PUT /users/ingredients/add`

Input: `userId`(string) and `ingredients`(array of string) in request body\
Description: Add `ingredients` to the user with `userId`. Ignores ingredients that is already present in user's ingredients

### `PUT /users/ingredients/remove`

Input: `userId`(string) and `ingredients`(array of string) in request body\
Description: Remove `ingredients` from the user with `userId`.

### `PUT /users/filtered/dishes/add`

Input: `userId`(string) and `dishes`(array of string) in request body\
Description: Add `dishes` to the user with `userId` such that everything in `dishes` will be filtered out during search.

### `PUT /users/filtered/dishes/remove`

Input: `userId`(string) and `dishes`(array of string) in request body\
Description: Remove `dishes` from the user with `userId`.

### `PUT /users/selected/dishes/add`

Input: `userId`(string) and `dishes`(array of string) in request body\
Description: Add `dishes` to the user with `userId` to indicate the user will be making the selected dishes.

### `PUT /users/selected/dishes/remove`

Input: `userId`(string) and `dishes`(array of string) in request body\
Description: Remove `dishes` from the user with `userId`.