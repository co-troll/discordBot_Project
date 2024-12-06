import { MySqlDialect } from "@sequelize/mysql";
import { Sequelize } from "@sequelize/core";
import { User } from "./user";
import { Role } from "./role";
import { Todo } from "./todo";
import { Commander } from "./commander";

export const sequelize = new Sequelize({
    dialect: MySqlDialect,
    database: "lostark",
    user: "root",
    password: "1111",
    host: "localhost",
    port: 3306,
    define: {
        timestamps: false,
    },
    models: [User, Role, Todo, Commander],
})