
- [End points](#end-points)
  * [Crawler](#crawler)
    + [`/crawler/init/allrecipes`](#--crawler-init-allrecipes-)
    + [`/crawler/update/allrecipes`](#--crawler-update-allrecipes-)
    + [`/crawler/index`](#--crawler-index-)
    + [`/crawler/index/drop`](#--crawler-index-drop-)
  * [Recipes](#recipes)
    + [`/recipes`](#--recipes-)
    + [`/recipes/drop`](#--recipes-drop-)
    + [`/recipes/search`](#--recipes-search-)
    + [`/recipes/user/search`](#--recipes-user-search-)
  * [Users](#users)
    + [`/users`](#--users-)
    + [`/users/create`](#--users-create-)
    + [`/users/delete`](#--users-delete-)
    + [`/users/edit`](#--users-edit-)
    + [`/users/ingredients/add`](#--users-ingredients-add-)
    + [`/users/ingredients/remove`](#--users-ingredients-remove-)
    + [`/users/filtered/dishes/add`](#--users-filtered-dishes-add-)
    + [`/users/filtered/dishes/remove`](#--users-filtered-dishes-remove-)

# End points

## Crawler

### `/crawler/init/allrecipes`

Method: `POST`
input: {beginIndex: \<integer>, endIndex: \<integer>} in request body
Description: Start crawling from allRecipes.com from `beginIndex` to `endIndex`.

### `/crawler/update/allrecipes`

Method: `POST`
input: {continueErrorCount: \<integer>} in request body
Description: Start updating from allRecipes.com and it will not stop until it hits `continueErrorCount` number of error continuesly.

### `/crawler/index`

Method: `GET`
input: none
Description: Get the last visited index for all the provider. These indexes is used to know where to start updating.

### `/crawler/index/drop`

Method: `POST`
input: none
Description: Remove all the crawler indexes.

## Recipes

### `/recipes`

Method: `GET`
input: none
Description: Randomly output a recipe.

### `/recipes/drop`

Method: `POST`
input: none
Description: Delete all recipes in database.

### `/recipes/search`

Method: `GET`
input: `?terms=term1+term2+...&page=<page number>&limit=<items per page>` in request query
Description: Search database with items that include the terms and ordered by score(recipes that matchs more terms will have a higher score).

### `/recipes/user/search`

Method: `GET`
input: `?page=<page number: integer>&limit=<items per page: integer>&userId=<userId: string>&minRating=<integer from 1-10>&xxx[value]=<integer>&xxx[strategy]=<at most|least: string>` in request query
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

Method: `GET`
input: none
Description: Return all the existing users.

### `/users/create`

Method: `PUT`
input: `user` in request body
Description: Creates a new user. See [newUser.json](../libs/schema/newUser.json).

### `/users/delete`

Method: `DELETE`
input: `id` in request body
Description: Deletes a user by id.

### `/users/edit`

Method: `PUT`
input: `user` and `id` in request body
Description: Update an existing user. See [editUser.json](../libs/schema/editUser.json).

### `/users/ingredients/add`

Method: `PUT`
input: `userId`(string) and `ingredients`(array of string) in request body
Description: Add `ingredients` to the user with `userId`. Ignores ingredients that is already present in user's ingredients

### `/users/ingredients/remove`

Method: `PUT`
input: `userId`(string) and `ingredients`(array of string) in request body
Description: Remove `ingredients` from the user with `userId`.

### `/users/filtered/dishes/add`

Method: `PUT`
input: `userId`(string) and `dishes`(array of string) in request body
Description: Add `dishes` to the user with `userId` such that everything in `dishes` will be filtered out during search.

### `/users/filtered/dishes/remove`

Method: `PUT`
input: `userId`(string) and `dishes`(array of string) in request body
Description: Remove `dishes` from the user with `userId`.