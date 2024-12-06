import { Client, Events, GatewayIntentBits, Message, REST as DiscordRestClient, Routes, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRow, ActionRowBuilder, TextChannel, AnyComponentBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { CommandHandler } from "./commands/commandHandler";
import { sequelize } from "./module";
import Sequelize from "@sequelize/core";
import { Commander } from "./module/commander";
import { Command } from "./config/slashCommand";
import { User } from "./module/user";
import { commanderList } from "./tools/commanders";
import { RaidStatus } from "./commands/lostark/raidStatus";
require("dotenv").config();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
export const ADMIN_ID = process.env.ADMIN_ID || "";
export const BOT_ID = process.env.BOT_ID || "";
export const GUILD_ID = process.env.GUILD_ID || "";
export const MYCHANNEL_ID = process.env.JJANGA_CHANNEL_ID || "";

class App {
    private client: Client;
    private discordRestClient: DiscordRestClient;
    private commandHandler: CommandHandler;

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        })

        this.discordRestClient = new DiscordRestClient().setToken(DISCORD_TOKEN);
        this.commandHandler = new CommandHandler();
    }

    startBot() {
        this.client.login(DISCORD_TOKEN)
        .then(() => {
            this.addClientEventHandlers();
            this.registerSlashCommands();
            this.registerSequelize();
            this.userStatusChangeCommand();
        })
        .catch((err) => {
            console.error("Error", err);
        })
    }

    addClientEventHandlers() {
        this.client.on(Events.MessageCreate, (message) => {
            const { content } = message;
            if (message.author.bot) 
                return;

            const date = new Date(message.createdTimestamp);

            console.log(`${date} | ${message.author.globalName}[${message.author.id}] : ${content}`);
        })

        this.client.on(Events.ClientReady, (readyClient) => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        })

        this.client.on(Events.Error, (err) => {
            console.error("Client Error", err);
        })

        this.client.on(Events.InteractionCreate, (interaction) => {
            if (interaction.isChatInputCommand())
                this.commandHandler.handleCommand(
                    interaction as ChatInputCommandInteraction
                )
        })
    }

    registerSlashCommands() {
        const commands = this.commandHandler.getSlashCommands();
        this.discordRestClient
            .put(Routes.applicationGuildCommands(BOT_ID, GUILD_ID), {
                body: commands,
            })
            .then((data: any) => {
                const arr: any[] = [];
                data.forEach((item: Command) => {
                    arr.push({ name: item.name, description: item.description })
                })
                console.table(arr);
            })
            .catch((err: Error) => {
                console.error("Error registerSlashCommand", err);
            })
    }

    userStatusChangeCommand() {
        const possible = new ButtonBuilder()
            .setCustomId('pos')
            .setLabel("가능")
            .setStyle(ButtonStyle.Primary);

        const impossible = new ButtonBuilder()
            .setCustomId('impos')
            .setLabel("불가능")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<any>()
            .addComponents(possible, impossible);

        this.client.on(Events.ClientReady, async () => {
            const channel = this.client.channels.cache.get(MYCHANNEL_ID) as TextChannel;
            await channel.bulkDelete(30);
            // channel.send({ content: "현재 레이드", components: [row] });
        })

        this.client.on(Events.InteractionCreate, (interaction) => {
            try {
                if (!interaction.isButton()) 
                    return;
                
                if (interaction.customId === "pos") {
                    User.update({ status: true }, { where: { userId: interaction.user.id }});
                    interaction.reply({ content: "변경 완료", ephemeral: true }).then((msg) => msg.delete());
                }
                else if (interaction.customId == "impos") {
                    User.update({ status: false }, { where: { userId: interaction.user.id }});
                    interaction.reply({ content: "변경 완료", ephemeral: true }).then((msg) => msg.delete());
                } 
            } 
            catch (e) {
                console.error(e);
            }

        })
    }

    async registerSequelize() {
        try {
            await sequelize.sync({ force: false });
            console.log("Sucess Connecting");

            commanderList.forEach(async (commander) => {
                await Commander.create({ commanderName: commander.name, commanderLevel: commander.level })
            })
        } 
        catch (err) {
            console.error("Failed Connecting", err);
        }
    }
}

const app = new App();
app.startBot();