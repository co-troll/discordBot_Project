import { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandOptionsOnlyBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ComponentType, Colors, ButtonBuilder, ButtonStyle, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextChannel, Message } from "discord.js";
import { Command } from "../../config/slashCommand";
import { Todo } from "../../module/todo";
import { Role } from "../../module/role";
import { User } from "../../module/user";
import { commanderList } from "../../tools/commanders";

export class RaidStatus implements Command {
    name: string = "레이드";
    description?: string | undefined = "레이드 선택 명령어";
    slashCommandConfig: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description!)
    async execute(interaction: ChatInputCommandInteraction): Promise<any> {
        const channel = interaction.channel as TextChannel;
        await channel.bulkDelete(30);
        const userList = await User.findAll();
        for (let user of userList) {
            await createRaidStatus(user.userId, interaction);
        }
    }

}

export const createRaidStatus = async (userId: string, interaction: ChatInputCommandInteraction) => {
    try {
        const rowList = await createBtnRow(userId);
        const channel = interaction.channel as TextChannel;
        // const channel = interaction.client.channels.cache.get(MYCHANNEL_ID) as TextChannel;


        if (rowList.length < 1) 
            return await interaction.reply({ content: "캐릭터가 등록되어있지 않습니다.", ephemeral: true })
        const response1 = await channel.send({
            content: "----------------------------------------------",
            components: rowList.slice(0, rowList.length < 3 ? rowList.length : 3)
        })


        // await interaction.reply({ content : "불러오기 완료", ephemeral: true }).then((msg) => msg.delete());


        const collector1 = response1.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.user.id === userId,
        })


        collector1.on("collect", async (interaction) => {
            const [charId, commanderId] = interaction.customId.split("_");

            if (commanderId === "reset") 
                await Todo.update({ status: false }, { where: { charId } });
            else 
                await Todo.update({ status: true }, { where: { charId, commanderId } });
            const rowList = await createBtnRow(userId); 
            await response1.edit({ content: "----------------------------------------------", components: rowList.slice(0, rowList.length < 3 ? rowList.length : 3) });
            await interaction.reply({ content : "변경완료", ephemeral: true }).then((msg) => msg.delete());
        })

        const response2 = rowList.length >= 4 ? await channel.send({
            components: rowList.slice(3)
        }) : await channel.send({ content: "없음"
        }).then((msg) => msg.delete())

        if (rowList.length >= 4) {

            const collector2 = response2.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: i => i.user.id === userId,
            })

            collector2.on("collect", async (interaction) => {
                const [charId, commanderId] = interaction.customId.split("_");

                if (commanderId === "reset") 
                    await Todo.update({ status: false }, { where: { charId } });
                else 
                    await Todo.update({ status: true }, { where: { charId, commanderId } });
                const rowList = await createBtnRow(userId);
                await response2.edit({ components: rowList.slice(3) });

                await interaction.reply({ content : "변경완료", ephemeral: true }).then((msg) => msg.delete());
            })
        }

        const utilRow = await utilBtnRow(userId);

        const response3 = await channel.send({
            components: [utilRow]
        })

        const collector3 = response3.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.user.id === userId,
        })

        collector3.on("collect", async (interaction) => {
            const [userId, utilName] = interaction.customId.split("_");

            const rowList = await createBtnRow(userId);
            if (utilName === "refresh") {
                await response1.edit({ content: "----------------------------------------------", components: rowList.slice(0, rowList.length < 3 ? rowList.length : 3) });
                if (rowList.length >= 4) {
                    await response2.edit({ components: rowList.slice(3) });
                }
                await interaction.reply({ content : "변경완료", ephemeral: true }).then((msg) => msg.delete());
            }
            else if (utilName === "remove") {
                await response1.delete();
                await response3.delete();
                if (rowList.length >= 4) {
                    await response2.delete();
                }
                await interaction.reply({ content : "삭제 완료", ephemeral: true }).then((msg) => msg.delete());
            }
        })
    } 
    catch (err) {
        console.error(err);
        await interaction.reply({ content : "캐릭터가 잘못 등록되어있습니다.", ephemeral: true }).then((msg) => setTimeout(() => (msg.delete()), 5000));
    }
}


export const createBtnRow = async (id: string) => {
    const charList = (await Role.findAll({ where: { userId: id }})).sort((a, b) => b.charLevel - a.charLevel);


    const rowList: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let char of charList) {
        const todoList = (await Todo.findAll({ where: { charId: char.charId }})).sort((a, b) => a.commanderId - b.commanderId);


        const nameBtn = new ButtonBuilder()
            .setCustomId(`${char.charId}_reset`)
            .setLabel(`${char.charName}/${char.charLevel}`)
            .setStyle(ButtonStyle.Primary);

        const raidBtn1 = new ButtonBuilder()
            .setCustomId(`${char.charId}_${todoList[0].commanderId}`)
            .setDisabled(todoList[0].status)
            .setLabel(`${commanderList[todoList[0].commanderId - 1].name}`)
            .setStyle(!todoList[0].status ? ButtonStyle.Secondary : ButtonStyle.Success);

        const raidBtn2 = new ButtonBuilder()
            .setCustomId(`${char.charId}_${todoList[1].commanderId}`)
            .setDisabled(todoList[1].status)
            .setLabel(`${commanderList[todoList[1].commanderId - 1].name}`)
            .setStyle(!todoList[1].status ? ButtonStyle.Secondary : ButtonStyle.Success);

        const raidBtn3 = new ButtonBuilder()
            .setCustomId(`${char.charId}_${todoList[2].commanderId}`)
            .setDisabled(todoList[2].status)
            .setLabel(`${commanderList[todoList[2].commanderId - 1].name}`)
            .setStyle(!todoList[2].status ? ButtonStyle.Secondary : ButtonStyle.Success);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(nameBtn, raidBtn1, raidBtn2, raidBtn3);

        rowList.push(row);
    }

    return rowList;
}

export const utilBtnRow = async (id: string) => {
    const refreshBtn = new ButtonBuilder()
        .setCustomId(`${id}_refresh`)
        .setLabel(`새로고침`)
        .setStyle(ButtonStyle.Secondary);

    const removeBtn = new ButtonBuilder()
        .setCustomId(`${id}_remove`)
        .setLabel(`삭제`)
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(refreshBtn, removeBtn);

    return row;
}