import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageComponentBuilder, MessageActionRowComponentBuilder, ComponentType, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { Command } from "../../config/slashCommand";
import { User } from "../../module/user";
import instance from "../../tools/axios"
import { Role } from "../../module/role";
import { Todo } from "../../module/todo";
import { commanderList } from "../../tools/commanders";

interface CharacterInfo {
    ServerName: string,
    CharacterName: string,
    CharacterLevel: number,
    CharacterClassName: string,
    ItemAvgLevel: string,
    ItemMaxLevel: string
}

export class ControlUser implements Command {
    name: string = "캐릭터";
    description?: string | undefined = "캐릭 등록 / 재등록 / 삭제 명령어";
    slashCommandConfig = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description!)
        .addSubcommand(subcommand =>
            subcommand
                .setName('등록')
                .setDescription('캐릭터 등록 명령어')
                .addStringOption(option => 
                    option.setName("캐릭터이름")
                        .setDescription("로아 캐릭터 이름 입력")
                        .setRequired(true)
        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('재등록')
                .setDescription('캐릭터 재등록 명령어')
                .addStringOption(option => 
                    option.setName("캐릭터이름")
                        .setDescription("로아 캐릭터 이름 입력")
                        .setRequired(true)
        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('삭제')
                .setDescription('캐릭터 삭제 명령어')
                .addStringOption(option => 
                    option.setName("캐릭터이름")
                        .setDescription("로아 캐릭터 이름 입력")
                        .setRequired(true))
        )
    async execute(interaction: ChatInputCommandInteraction): Promise<any> {
        try {

            switch (interaction.options.getSubcommand()) {
                case "등록":
                    await this.createUserCommand(interaction);
                    return;
                case "재등록":
                    await this.updateUserCommand(interaction);
                    return;
                case "삭제":
                    await this.deleteUserCommand(interaction);
                    return;
                default:
                    return;
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    
    createUserCommand = async (interaction: ChatInputCommandInteraction) => {
        try {
            const user = await User.findOne({ where: { userId: interaction.user.id }});

            if (!user) 
                await User.create({ userId: interaction.user.id, name: interaction.user.globalName!, status: false })

            const charName = interaction.options.getString("캐릭터이름");

            const { data } : { data : CharacterInfo[] } = await instance({
                method: "get",
                url: `characters/${charName}/siblings`
            })
            
            if (data.length < 1) 
                return await interaction.reply({ content: "존재하지 않는 캐릭터입니다.", ephemeral: true }).then((msg) => setTimeout(() => {
                    msg.delete();
                }, 5000));


            const charInfo = data.find((char) => {if (char.CharacterName === charName) return true});

            const charCheck = await Role.findOne({ where: { charName: charName }});

            if (charCheck) 
                return await interaction.reply({ content: "이미 존재하는 캐릭터입니다.", ephemeral: true }).then((msg) => setTimeout(() => {
                    msg.delete();
                }, 5000));


            
            await Role.create({ 
                userId: interaction.user.id,
                charName: charInfo!.CharacterName,
                charClass: charInfo!.CharacterClassName,
                charLevel: parseInt(charInfo!.ItemMaxLevel.replace(",", ""))
            })

            // await interaction.reply({ content: "등록 완료", ephemeral: true }).then((msg) => setTimeout(() => msg.delete(), 5000));

            const char = await Role.findOne({ where: { charName: charName }});

            const builder: StringSelectMenuOptionBuilder[] = [];
            commanderList.forEach((commander, index) => {
                if (commander.level > char!.charLevel) 
                    return;
                builder.push(new StringSelectMenuOptionBuilder()
                .setLabel(`${commander.name}`)
                .setDescription(`Lv.${commander.level}`)
                .setValue(`${index + 1}`)
            )
            })
            const select = new StringSelectMenuBuilder()
                .setCustomId(`${charName}raid`)
                .setPlaceholder(`${charName} / ${char?.charLevel}`)
                .setMinValues(3)
                .setMaxValues(3)
                .addOptions(
                    ...builder
            );
            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(select);

            const response = await interaction.reply({
                content: `캐릭터 : ${charName} / 군단장 3개 선택`,
                components: [row],
                ephemeral: true
            })

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: i => i.user.id === interaction.user.id,
                time: 30_000,
            })
    
            collector.on("collect", async (interaction) => {
                if (interaction.values.length !== 3) 
                    await interaction.reply({ content: "군단장 3개를 골라주세요", ephemeral: true }).then((msg) => setTimeout(() => (msg.delete()), 5000));
                else {
                    for (let value of interaction.values)
                        await Todo.create({ charId: char!.charId, commanderId: parseInt(value), status: false })
                    await response.delete();
                    await interaction.reply({ content: "설정 완료", ephemeral: true }).then((msg) => setTimeout(() => (msg.delete()), 5000));
                }
            })
        }
        catch(err) {
            console.error(err);
        }
    }

    updateUserCommand = async (interaction: ChatInputCommandInteraction) => {
        try {
            const user = await User.findOne({ where: { userId: interaction.user.id }});

            if (!user) 
                return await interaction.reply({ content: "캐릭 등록 먼저 해주세요.", ephemeral: true }).then((msg) => setTimeout(() => {
                    msg.delete();
                }, 5000));

            const charName = interaction.options.getString("캐릭터이름");


            const charCheck = await Role.findOne({ where: { charName: charName }});

            if (!charCheck) 
                return await interaction.reply({ content: "존재하지 않는 캐릭터입니다.", ephemeral: true }).then((msg) => setTimeout(() => {
                    msg.delete();
                }, 5000));

            await Role.destroy({ where: { charName: charName } });

            const { data } : { data : CharacterInfo[] } = await instance({
                method: "get",
                url: `characters/${charName}/siblings`
            })
            
            if (data.length < 1) 
                return await interaction.reply({ content: "존재하지 않는 캐릭터입니다.", ephemeral: true }).then((msg) => setTimeout(() => {
                    msg.delete();
                }, 5000));

            const charInfo = data.find((char) => {if (char.CharacterName === charName) return true});
            
            await Role.create({ 
                userId: interaction.user.id,
                charName: charInfo!.CharacterName,
                charClass: charInfo!.CharacterClassName,
                charLevel: parseInt(charInfo!.ItemMaxLevel.replace(",", ""))
            })

            // await interaction.reply({ content: "등록 완료", ephemeral: true }).then((msg) => setTimeout(() => msg.delete(), 5000));

            const char = await Role.findOne({ where: { charName: charName }});

            const builder: StringSelectMenuOptionBuilder[] = [];
            commanderList.forEach((commander, index) => {
                if (commander.level > char!.charLevel) 
                    return;
                builder.push(new StringSelectMenuOptionBuilder()
                .setLabel(`${commander.name}`)
                .setDescription(`Lv.${commander.level}`)
                .setValue(`${index + 1}`)
            )
            })
            const select = new StringSelectMenuBuilder()
                .setCustomId(`${charName}raid`)
                .setPlaceholder(`${charName} / ${char?.charLevel}`)
                .setMinValues(3)
                .setMaxValues(3)
                .addOptions(
                    ...builder
            );
            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(select);

            const response = await interaction.reply({
                content: `캐릭터 : ${charName} / 군단장 3개 선택`,
                components: [row],
                ephemeral: true
            })

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: i => i.user.id === interaction.user.id,
                time: 30_000,
            })
    
            collector.on("collect", async (interaction) => {
                if (interaction.values.length !== 3) 
                    await interaction.reply({ content: "군단장 3개를 골라주세요", ephemeral: true }).then((msg) => setTimeout(() => (msg.delete()), 5000));
                else {
                    for (let value of interaction.values)
                        await Todo.create({ charId: char!.charId, commanderId: parseInt(value), status: false })
                    await response.delete();
                    await interaction.reply({ content: "설정 완료", ephemeral: true }).then((msg) => setTimeout(() => (msg.delete()), 5000));
                }
            })
        }
        catch(err) {
            console.error(err);
        }
    }

    deleteUserCommand = async (interaction: ChatInputCommandInteraction) => {
        try {
            const user = await User.findOne({ where: { userId: interaction.user.id }});

            if (!user) 
                return await interaction.reply({ content: "캐릭 등록 먼저 해주세요.", ephemeral: true }).then((msg) => setTimeout(() => {
                    msg.delete();
                }, 5000));

            const charName = interaction.options.getString("캐릭터이름");


            const charCheck = await Role.findOne({ where: { charName: charName }});

            if (!charCheck) 
                return await interaction.reply({ content: "존재하지 않는 캐릭터입니다.", ephemeral: true }).then((msg) => setTimeout(() => {
                    msg.delete();
                }, 5000));

            await Role.destroy({ where: { charName: charName } });

            return await interaction.reply({ content: "캐릭 삭제 완료", ephemeral: true }).then((msg) => setTimeout(() => {
                msg.delete();
            }, 5000));
        }
        catch(err) {
            console.error(err);
        }
    }
}