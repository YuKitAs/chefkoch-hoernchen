import { Brackets } from "typeorm";
import { AppDataSource } from "./data-source"
import { History } from "./entity/History"
import { Flavor, Ingredient, MenuType, Recipe } from "./entity/Recipe"
import prompts from 'prompts'
import { exit } from "process";

const questions = [
    {
      type: 'multiselect',
      name: 'menuType',
      message: 'Welche Menüart?',
      choices: Object.values(MenuType).map(value => ({ value }))
    },
    {
      type: 'multiselect',
      name: 'ingredient',
      message: 'Welche Zutaten?',
      choices: Object.values(Ingredient).map(value => ({ value }))
    },
    {
      type: 'multiselect',
      name: 'flavor',
      message: 'Welcher Geschmack?',
      choices: Object.values(Flavor).map(value => ({ value }))
    },
    {
      type: 'number',
      name: 'prepTime',
      message: 'Wie viele Minuten darf die Zubereitung höchstens dauern?'
    }
  ] as Array<prompts.PromptObject<string>>

AppDataSource.initialize().then(async () => {

    console.log('Hallo, mein Chefkoch-Hörnchen, worauf hättest du Lust? 🍳')

    const response = await prompts(questions);

    const menuTypes = response.menuType && response.menuType.length > 0 ? response.menuType : Object.values(MenuType)
    const ingredients = response.ingredient && response.ingredient.length > 0 ? response.ingredient : Object.values(Ingredient)
    const flavors = response.flavor && response.flavor.length > 0 ? response.flavor : Object.values(Flavor)
    const prepTime = response.prepTime ? response.prepTime : 1440

    const builder = AppDataSource.getRepository(Recipe).createQueryBuilder("recipe")
                        .where("recipe.menuType IN (:...menuTypes)", { menuTypes })
                        .andWhere(new Brackets(qb => {
                            qb.where("recipe.ingredients && ARRAY[:...ingredients]::recipe_ingredients_enum[]", { ingredients })

                            if (ingredients.length === Object.values(Ingredient).length) {
                                qb.orWhere("recipe.ingredients IS NULL")
                            }
                        }))
                        .andWhere(new Brackets(qb => {
                            qb.where("recipe.flavors && ARRAY[:...flavors]::recipe_flavors_enum[]", { flavors })
                        }))
                        .andWhere("recipe.prepTime <= :prepTime", { prepTime })

    // DEBUG
    // console.log(builder.getQueryAndParameters())

    const recipes = await builder.getMany()

    if (recipes.length === 0) {
        console.log('Sorry, ich habe leider keine Rezepte gefunden :(')
    } else {
        console.log('Rezeptideen:')
        for (const recipe of recipes) {
            console.log(Object.fromEntries(Object.entries(recipe).filter(([key]) => key !== 'id' && recipe[key])))
            const histories = await AppDataSource.getRepository(History).find({ where: { recipeId: recipe.id }, order: { date: "DESC" } })
            const count = histories.length
            if (count > 0) {
                const formattedDate = new Date(histories[0].date).toLocaleDateString('de-DE', { dateStyle: 'full' })
                console.log(`${count} Mal zubereitet. Zuletzt am ${formattedDate}.`)
            }
            console.log()
        }
        console.log('Viel Spaß :)')
        exit(0)
    }

}).catch(error => console.log(error))
