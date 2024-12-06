import { DataTypes, Model } from "@sequelize/core";
import { Attribute, NotNull } from "@sequelize/core/decorators-legacy";

export class Todo extends Model {
    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare charId: number;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare commanderId: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare status: boolean;
}