import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandOptionsOnlyBuilder, ChatInputCommandInteraction, EmbedBuilder, JSONEncodable, APIEmbed, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { Command } from "../../config/slashCommand";
import { User } from "../../module/user";

export class UserStatus implements Command {
    name: string = "유저상태";
    description?: string | undefined = "유저 상태 확인 명령어";
    slashCommandConfig: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description!);
    async execute(interaction: ChatInputCommandInteraction): Promise<any> {
        const users = await User.findAll();
        const status: { name: string, value: string, inline: boolean }[] = [];
        users.forEach((user) => {
            status.push({ name: user.name, value: user.status ? "⭕" : "❌" , inline: true });
        })

        const embed: APIEmbed = {
            color: 0x0099ff,
            title: '유저 상태',
            fields: [
                ...status
            ],
            timestamp: new Date().toISOString(),
        };

        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

}