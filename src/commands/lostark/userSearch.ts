import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandOptionsOnlyBuilder, ChatInputCommandInteraction, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, Sticker, APIEmbed, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { Command } from "../../config/slashCommand";
import { commanderList } from "../../tools/commanders";
import { Todo } from "../../module/todo";
import { Role } from "../../module/role";

export class UserSearch implements Command {
    name: string = "검색";
    description?: string | undefined = "군단장을 돌리지 않은 캐릭 검색";
    slashCommandConfig: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description!)
    async execute(interaction: ChatInputCommandInteraction): Promise<any> {
        const builder: StringSelectMenuOptionBuilder[] = [];
        commanderList.forEach((commander, index) => {
            builder.push(new StringSelectMenuOptionBuilder()
                .setLabel(`${commander.name}`)
                .setDescription(`Lv.${commander.level}`)
                .setValue(`${index + 1}`)
            )
        })
        const select = new StringSelectMenuBuilder()
            .setCustomId(`raid`)
            .setPlaceholder(`플레이할 군당장 선택`)
            .addOptions(
                ...builder
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select);

        const response = await interaction.reply({
            components: [row],
            ephemeral: true
        })

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: i => i.user.id === interaction.user.id,
            time: 60_000,
        })

        collector.on("collect", async (interaction) => {
            const [value] = interaction.values;
            const todoList = await Todo.findAll({ where: { commanderId: value, status: false }});

            const status: { name: string, value: string, inline: boolean }[] = [];
            let count = 1;
            for (const todo of todoList) {
                if (count === 25) 
                    status.push({ name: "그 외", value: `${todoList.length - 24} 명` , inline: true });
                const char = await Role.findOne({ where: { charId: todo.charId }})
                status.push({ name: char!.charName, value: `Lv.${char!.charLevel}` , inline: true });
                count++;
            }

            const embed: APIEmbed = {
                color: 0x0099ff,
                title: `${commanderList[parseInt(value) - 1].name}`,
                fields: [
                    ...status
                ],
                timestamp: new Date().toISOString(),
            };
            
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        })
    }
    
}