import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

export enum MenuType {
    BREAKFAST = 'Frühstück',
    DESSERT = 'Dessert',
    DRINKS = 'Getränke',
    MAIN_DISH = 'Hauptspeise',
    SIDE_DISH = 'Beilage',
    SNACKS = 'Snacks',
    STARTER = 'Vorspeise'
}

export enum Ingredient {
    FISH = 'Fisch',
    MEAT = 'Fleisch',
    NOODLE = 'Nudeln',
    POTATO = 'Kartoffeln',
    RICE = 'Reis',
    SEAFOOD = 'Meeresfrüchte',
    VEGETABLES = 'Gemüse'
}

export enum Flavor {
    SALTY = 'Salzig',
    SOUR = 'Sauer',
    SPICY = 'Scharf',
    SWEET = 'Süß'
}

@Entity()
export class Recipe {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100, unique: true })
    name!: string

    @Index()
    @Column({
        name: 'menu_type',
        type: 'enum',
        enum: MenuType,
        default: MenuType.MAIN_DISH
    })
    menuType!: MenuType

    @Index()
    @Column({
        type: 'enum',
        enum: Ingredient,
        array: true,
        nullable: true
    })
    ingredients: Ingredient[]

    @Index()
    @Column({
        type: 'enum',
        enum: Flavor,
        array: true,
        default: [Flavor.SALTY]
    })
    flavors!: Flavor[]

    @Column({ name: 'prep_time' })
    prepTime!: number

    @Column('text', { nullable: true })
    url?: string

}
