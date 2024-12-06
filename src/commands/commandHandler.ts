import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../config/slashCommand";
import { PingCommand } from "./utility/ping";
import { UserStatus } from "./lostark/userStatus";
import { RaidStatus } from "./lostark/raidStatus";
import { UserSearch } from "./lostark/userSearch";
import { ControlUser } from "./lostark/controlUser";
import { ResetUser } from "./lostark/reset";
import { errorCheck } from "./lostark/errorCheck";

export class CommandHandler {
    private commands: Command[];

    constructor() {
        this.commands = [
            new PingCommand(),
            new ControlUser(),
            new RaidStatus(),
            new ResetUser(),
            new errorCheck(),
        ];
    }

    getSlashCommands() {
        return this.commands.map((command: Command) => 
            command.slashCommandConfig.toJSON()
        )
    }

    async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const commandName = interaction.commandName;
        
        const matchedCommand = this.commands.find(
            (command) => command.name === commandName
        )

        if (!matchedCommand) 
            return Promise.reject("Command not matched");

        matchedCommand
            .execute(interaction)
            .then(() => {
                console.log(
                    `Sucesfully executed command [/${interaction.commandName}]`,
                    {
                        guild: { id: interaction.guildId, name: interaction.guild?.name },
                        user: { name: interaction.user.globalName }
                    }
                )
            })
            .catch((err) => {
                console.log(
                    `Error executing command [/${interaction.commandName}] : ${err}`,
                    {
                        guild: { id: interaction.guildId, name: interaction.guild?.name },
                        user: { name: interaction.user.globalName }
                    }
                )
            })
    }
}