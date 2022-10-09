import { AppDataSource } from "./data-source"
import { History } from "./entity/History"
import { Flavor, Ingredient, MenuType, Recipe } from "./entity/Recipe"

AppDataSource.initialize().then(async () => {

    console.log("Inserting a new recipe into the database...")
    const recipe = new Recipe()
    recipe.name = 'Aglio Olio'
    recipe.menuType = MenuType.MAIN_DISH
    recipe.ingredients = [Ingredient.NOODLE]
    recipe.flavors = [Flavor.SALTY, Flavor.SPICY]
    recipe.prepTime = 30
    await AppDataSource.manager.save(recipe)
    console.log("Saved a new recipe with id: " + recipe.id)
    
    const history = new History()
    history.recipeId = recipe.id
    history.date = '2022-09-24'
    await AppDataSource.manager.save(history)

    console.log("Fetching a recipe...")
    const recipes = await AppDataSource.manager.find(Recipe)
    console.log("Fetched recipe:", recipes[0])
    const recipeHistory = await AppDataSource.getRepository(History).findOne({ where: { 
        recipeId: recipe.id
    }})
    console.log("Last cooked at:", new Date(recipeHistory.date).toLocaleDateString('de-DE', { dateStyle: 'full' }))

}).catch(error => console.log(error))
