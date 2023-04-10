import { Brackets } from "typeorm";
import { AppDataSource } from "./data-source"
import { History } from "./entity/History"
import { Flavor, Ingredient, MenuType, Recipe } from "./entity/Recipe"
import prompts from 'prompts'
import { exit } from "process";

AppDataSource.initialize().then(async () => {
  const question = [
    {
      type: 'select',
      name: 'intent',
      message: 'Magst du was kochen oder ein gekochtes Gericht speichern?',
      choices: [
        { title: 'Kochen', value: '1' },
        { title: 'Speichern', value: '2' },
        { title: 'Nichts', value: '3' }
      ]
    }
  ] as Array<prompts.PromptObject<string>>
  
  console.log('Hallo, mein Chefkoch-Hörnchen!')
    
  const response = await prompts(question)
  switch(response.intent) {
    case '1':
      selectRecipe()
      break
    case '2':
      addHistory()
      break
    case '3':
      console.log('Okay, bis dann 👋')
      exit()
    default:
      break
  }

}).catch(error => console.log(error))

async function selectRecipe() {
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

  console.log('Worauf hättest du Lust? 🍳')

  const response = await prompts(questions)

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
}

async function addHistory() {
  while (true) {
    console.log('Welches Rezept hast du gekocht?');

    const recipes = await AppDataSource.getRepository(Recipe).find({order: { name: "ASC" }})
    for (const recipe of recipes) {
      console.log(`${recipe.id}: ${recipe.name}`)
    }
  
    const questions = [
      {
        type: 'number',
        name: 'recipe',
        message: 'Bitte nenn mir die ID von einem aufgelisten Rezept',
      },
      {
        type: 'select',
        name: 'date',
        message: 'Wann wurde es gekocht?',
        choices: [
          { title: 'Heute', value: '1' },
          { title: 'An einem anderen Tag', value: '2' },
        ]
      },
      {
        type: 'text',
        name: 'specificDate',
        message: 'Bitte gib mir ein Datum im Format yyyy-MM-dd, z.B. 2023-02-03.',
      },
      {
        type: 'select',
        name: 'next',
        message: 'Hast du noch was anderes gekocht?',
        choices: [
          { title: 'Ja', value: '1' },
          { title: 'Nein', value: '2' },
        ]
      }
    ] as Array<prompts.PromptObject<string>>
  
    let recipeExists = false
    while (!recipeExists) {
      const response = await prompts(questions[0])
      const recipeId = response.recipe
      if (!(await AppDataSource.getRepository(Recipe).findOne({ where: { id: recipeId } }))) {
        console.log('Rezept existiert nicht!')
      } else {
        recipeExists = true
        const response = await prompts(questions[1])
        if (response.date === '1') {
          await AppDataSource.getRepository(History).insert({recipeId: recipeId, date: new Date().toDateString()})
        } else {   
          const response = await prompts(questions[2])
          await AppDataSource.getRepository(History).insert({recipeId: recipeId, date: response.specificDate})
        }
      }
    }
  
    console.log('Gespeichert. 👌')

    const response = await prompts(questions[3])
    if (response.next === '2') {
      exit(0)
    }
  }
}