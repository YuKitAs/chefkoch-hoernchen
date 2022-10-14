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
      choices: Object.values(MenuType).map(value => { return { value } })
    },
    {
      type: 'multiselect',
      name: 'ingredient',
      message: 'Welche Zutaten?',
      choices: Object.values(Ingredient).map(value => { return { value } })
    },
    {
      type: 'multiselect',
      name: 'flavor',
      message: 'Welcher Geschmack?',
      choices: Object.values(Flavor).map(value => { return { value } })
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
    const ingredients = response.ingredient && response.ingredient.length > 0 ? response.ingredient : Object.values(Ingredient)
    const flavors = response.flavor && response.flavor.length > 0 ? response.flavor : Object.values(Flavor)
    const prepTime = response.prepTime ? response.prepTime : 1440

    const builder = AppDataSource.getRepository(Recipe).createQueryBuilder("recipe")
                        .where("recipe.menuType IN (:...menuTypes)", { menuTypes })
                        .andWhere(new Brackets(qb => {
                            for (const ingredient of ingredients) {
                                qb.orWhere(":ingredient = ANY(ingredients)", { ingredient })
                            }
                            qb.orWhere("recipe.ingredients IS NULL")
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
