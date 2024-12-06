import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandOptionsOnlyBuilder, ChatInputCommandInteraction, EmbedBuilder, JSONEncodable, APIEmbed, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { Command } from "../../config/slashCommand";
import { User } from "../../module/user";
import { ADMIN_ID } from "../..";
import { Todo } from "../../module/todo";

export class ResetUser implements Command {
    name: string = "초기화";
    description?: string | undefined = "일주일 초기화 명령어";
    slashCommandConfig: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description!);
    async execute(interaction: ChatInputCommandInteraction): Promise<any> {
        if (interaction.user.id !== ADMIN_ID) 
            return await interaction.reply({ content: "관리자가 아닙니다.", ephemeral: true }).then((msg) => setTimeout(() => (msg.delete()), 3000));

        await Todo.update({ status: false }, { where: { status: true }});

        return await interaction.reply({ content: "초기화 완료", ephemeral: true }).then((msg) => setTimeout(() => (msg.delete()), 3000));
    }

}