import { DataTypes, Model, NonAttribute } from "@sequelize/core";
import { Attribute, AutoIncrement, HasMany, NotNull, PrimaryKey } from "@sequelize/core/decorators-legacy";
import { Todo } from "./todo";

export class Role extends Model {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare charId: number;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare userId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare charName: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare charClass: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare charLevel: number;

    @HasMany(() => Todo, { foreignKey: "charId" })
    declare todos?: NonAttribute<Todo>;
}