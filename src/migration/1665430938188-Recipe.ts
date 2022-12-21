import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecipeSeed1665430938188 implements MigrationInterface {
  name = 'RecipeSeed1665430938188'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, ingredients, flavors, prep_time)
      VALUES ('Aglio Olio', 'Hauptspeise', '{"Nudeln"}', '{"Salzig", "Scharf"}', 30)
      ON CONFLICT (name) DO NOTHING;`
    )

    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, ingredients, flavors, prep_time)
      VALUES ('Pesto', 'Hauptspeise', '{"Nudeln", "Gemüse"}', '{"Salzig"}', 30)
      ON CONFLICT (name) DO NOTHING;`
    )

    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, ingredients, flavors, prep_time)
      VALUES ('Lachsfilet mit Dillsauce und gebratenen Kartoffeln', 'Hauptspeise', '{"Fisch", "Kartoffeln", "Gemüse"}', '{"Salzig"}', 40)
      ON CONFLICT (name) DO NOTHING;`
    )

    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, ingredients, flavors, prep_time, url)
      VALUES ('Lasagne', 'Hauptspeise', '{"Nudeln", "Fleisch", "Gemüse"}', '{"Salzig", "Scharf"}', 100, 'https://www.chefkoch.de/rezepte/745721177147257/Lasagne.html')
      ON CONFLICT (name) DO NOTHING;`
    )

    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, flavors, prep_time)
      VALUES ('Schokopudding mit Vanillesoße', 'Dessert', '{"Süß"}', 20)
      ON CONFLICT (name) DO NOTHING;`
    )

    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, ingredients, flavors, prep_time)
      VALUES ('Obstsalat', 'Dessert', '{"Obst"}', '{"Süß"}', 30)
      ON CONFLICT (name) DO NOTHING;`
    )

    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, flavors, prep_time, url)
      VALUES ('Zombie', 'Getränke', '{"Süß", "Sauer"}', 10, 'https://www.gutekueche.at/zombie-cocktail-rezept-17979')
      ON CONFLICT (name) DO NOTHING;`
    )

    await queryRunner.query(
      `INSERT INTO recipe (name, menu_type, flavors, prep_time, url)
      VALUES ('Mojito', 'Getränke', '{"Süß", "Sauer"}', 10, 'https://www.gutekueche.at/mojito-cocktail-rezept-17926')
      ON CONFLICT (name) DO NOTHING;`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // do nothing
  }
  
}