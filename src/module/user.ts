import { DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "@sequelize/core";
import { Attribute, PrimaryKey, NotNull, HasMany } from '@sequelize/core/decorators-legacy';
import { Role } from "./role";
import { Todo } from "./todo";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    declare userId: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string;

    @Attribute(DataTypes.BOOLEAN) 
    @NotNull
    declare status: boolean;

    @HasMany(() => Role, { foreignKey: "userId" })
    declare roles?: NonAttribute<Role[]>
}