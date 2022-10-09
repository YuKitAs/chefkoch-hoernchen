import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

@Entity()
export class History {

    @PrimaryGeneratedColumn()
    id: number

    @Index()
    @Column()
    recipeId!: number

    @Column({ type: 'date' })
    date!: string

}