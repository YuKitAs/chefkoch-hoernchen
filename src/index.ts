import { Brackets } from "typeorm";
import { AppDataSource } from "./data-source"
import { History } from "./entity/History"
import { Flavor, Ingredient, MenuType, Recipe } from "./entity/Recipe"
import prompts from 'prompts'

const questions = [
    {
      type: 'multiselect',
      name: 'menuType',
      message: 'Welche Menüart?',
      choices: [
        { id: 0, value: MenuType.BREAKFAST },
        { id: 1, value: MenuType.DESSERT },
        { id: 2, value: MenuType.DRINKS },
        { id: 3, value: MenuType.MAIN_DISH },
        { id: 4, value: MenuType.SIDE_DISH },
        { id: 5, value: MenuType.SNACKS },
        { id: 6, value: MenuType.STARTER }
      ]
    },
    {
      type: 'multiselect',
      name: 'ingredient',
      message: 'Welche Zutaten?',
      choices: [
        { id: 0, value: Ingredient.FISH },
        { id: 1, value: Ingredient.MEAT },
        { id: 2, value: Ingredient.NOODLE },
        { id: 3, value: Ingredient.POTATO },
        { id: 4, value: Ingredient.RICE },
        { id: 5, value: Ingredient.SEAFOOD },
        { id: 6, value: Ingredient.VEGETABLES }
      ]
    },
    {
      type: 'multiselect',
      name: 'flavor',
      message: 'Welcher Geschmack?',
      choices: [
        { id: 0, value: Flavor.SALTY },
        { id: 1, value: Flavor.SOUR },
        { id: 2, value: Flavor.SPICY },
        { id: 3, value: Flavor.SWEET }
      ]
    },
    {
      type: 'number',
      name: 'prepTime',
      message: 'Wie viele Minuten darf die Zubereitung höchstens dauern?'
    }
  ] as Array<prompts.PromptObject<string>>

AppDataSource.initialize().then(async () => {

    console.log('Hallo, mein Chefkoch-Hörnchen, worauf hättest du Lust zu kochen? 🍳')

    const response = await prompts(questions);

    const menuTypes = response.menuType && response.menuType.length > 0 ? response.menuType : Object.values(MenuType)
    const ingredients = response.ingredient
    const flavors = response.flavor && response.flavor.length > 0 ? response.flavor : Object.values(Flavor)
    const prepTime = response.prepTime ? response.prepTime : 1440

    const builder = AppDataSource.getRepository(Recipe).createQueryBuilder("recipe")
                        .where("recipe.menuType IN (:...menuTypes)", { menuTypes })
                        .andWhere(new Brackets(qb => {
                            for (const ingredient of ingredients) {
                                qb.orWhere(":ingredient = ANY(ingredients)", { ingredient })
                            }
                        }))
                        .andWhere(new Brackets(qb => {
                            for (const flavor of flavors) {
                                qb.orWhere(":flavor = ANY(flavors)", { flavor })
                            }
                        }))
                        .andWhere("recipe.prepTime <= :prepTime", { prepTime })

    // DEBUG
    // console.log(builder.getQuery())
    // console.log(builder.getParameters())

    const recipes = await builder.getMany()

    if (recipes.length === 0) {
        console.log('Sorry, ich habe leider keine Rezepte gefunden :(')
    } else {
        console.log('Rezeptideen:')
        for (const recipe of recipes) {
            console.log(Object.fromEntries(Object.entries(recipe).filter(([key]) => key !== 'id' && recipe[key])))
            const recipeDate = (await AppDataSource.getRepository(History).findOne({ where: { recipeId: recipe.id }}))?.date
            if (recipeDate) {
                console.log('Zuletzt gekocht: ', new Date(recipeDate).toLocaleDateString('de-DE', { dateStyle: 'full' }))
            }
        }
        console.log('Viel Spaß :)')
    }

}).catch(error => console.log(error))
