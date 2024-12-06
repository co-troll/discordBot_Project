import { DataTypes, Model, NonAttribute } from "@sequelize/core";
import { Attribute, AutoIncrement, HasMany, NotNull, PrimaryKey } from "@sequelize/core/decorators-legacy";
import { Todo } from "./todo";

export class Commander extends Model {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare commanderId: number;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare commanderName: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare commanderLevel: number;

    @HasMany(() => Todo, { foreignKey: "commanderId" })
    declare todos?: NonAttribute<Todo>;
}