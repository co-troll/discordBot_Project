import { CacheType, ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../config/slashCommand";
import { Commander } from "../../module/commander";

export class PingCommand implements Command {
    name = "ping";
    description = "Pings the Bot";
    slashCommandConfig = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)

    async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {
        return await interaction.reply({ content: "Pong!", ephemeral: true });
    }
    
}