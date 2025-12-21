"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const mineflayer_1 = __importDefault(require("mineflayer"));
const Runtime_1 = require("./commands/Runtime");
const mineflayer_antiafk_1 = __importDefault(require("@rhld16/mineflayer-antiafk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const login_1 = require("./Account-Bots/login");
const register_1 = require("./Account-Bots/register");
const Messages_1 = require("./Messages/Messages");
const prismarine_auth_1 = require("prismarine-auth");
const AutomaticEntryExit_1 = require("./AutomaticEntryExit");
const settingsFilePath = path_1.default.join(__dirname, '../config/Settings.json');
const loadedConfig = JSON.parse(fs_1.default.readFileSync(settingsFilePath, 'utf-8'));
function createRandomPass(len = 12) {
    const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedPass = '';
    for (let i = 0; i < len; i++) {
        generatedPass += charSet.charAt(crypto_1.default.randomInt(0, charSet.length));
    }
    return generatedPass;
}
function fetchOrMakePass(username, authSettings) {
    if (!authSettings.passwords[username]) {
        const newPass = createRandomPass();
        authSettings.passwords[username] = newPass;
        fs_1.default.writeFileSync(settingsFilePath, JSON.stringify(loadedConfig, null, 2));
    }
    return authSettings.passwords[username];
}
async function makeNewBot(username, srvSettings, isMainBot = false) {
    let botOpts = {
        host: srvSettings.host,
        port: srvSettings.port,
        version: srvSettings.version
    };
    const authenticationCfg = srvSettings.auth || { enabled: false, type: 'offline', cacheBaseDir: './authcache' };
    if (authenticationCfg.enabled && authenticationCfg.type === 'microsoft') {
        const cachePath = path_1.default.join(__dirname, '../', authenticationCfg.cacheBaseDir, username);
        const authOpts = {
            authTitle: prismarine_auth_1.Titles.MinecraftJava,
            flow: 'sisu',
            deviceType: 'Win32'
        };
        const authHandler = new prismarine_auth_1.Authflow('', cachePath, authOpts);
        const tokenData = await authHandler.getMinecraftJavaToken({ fetchProfile: true });
        if (tokenData.profile.name !== username) {
            throw new Error(`Name mismatch: expected ${username} but got ${tokenData.profile.name}`);
        }
        botOpts.session = {
            accessToken: tokenData.token,
            profile: tokenData.profile
        };
    }
    else {
        botOpts.username = username;
    }
    const newBot = mineflayer_1.default.createBot(botOpts);
    newBot.on("login", () => console.log(`${username} connected`));
    newBot.on("spawn", () => {
        console.log(`${username} spawned`);
        newBot.chat(`Hello from ${username}`);
        if (isMainBot) {
            newBot.on('chat', (sender, incomingMsg) => {
                if (sender === newBot.username)
                    return;
                (0, Runtime_1.handleRuntimeCmd)(newBot, sender, incomingMsg);
            });
        }
        if (srvSettings.autoAuth.enabled) {
            newBot.on('message', (jsonMessage) => {
                const msgText = jsonMessage.toString().toLowerCase();
                const userPass = fetchOrMakePass(newBot.username, srvSettings.autoAuth);
                if (msgText.includes('/register')) {
                    console.log(`${newBot.username} trying to register`);
                    (0, register_1.botRegisterFunction)(newBot, userPass);
                }
                else if (msgText.includes('/login')) {
                    console.log(`${newBot.username} trying to login`);
                    (0, login_1.botLoginFunction)(newBot, userPass);
                }
            });
        }
        if (srvSettings.randomChat.enabled) {
            (0, Messages_1.beginRandomMessaging)(newBot, srvSettings.randomChat.messages, srvSettings.randomChat.interval);
        }
        newBot.loadPlugin(mineflayer_antiafk_1.default);
        newBot.afk.setOptions({
            fishing: false,
            chatting: false,
            killauraEnabled: false,
            autoEatEnabled: false,
            minActionsInterval: 1000,
            maxActionsInterval: 5000,
            minWalkingTime: 2000,
            maxWalkingTime: 6000
        });
        newBot.afk.start();
    });
    newBot.on("error", (errorObj) => console.error(`${username} error`, errorObj));
    newBot.on("kicked", (kickReason) => console.log(`${username} kicked`, kickReason));
    return newBot;
}
(async () => {
    for (const srvCfg of loadedConfig.servers) {
        const botList = [];
        for (const [idx, botUsername] of (srvCfg.bots || []).entries()) {
            if (idx > 0)
                await new Promise(resolve => setTimeout(resolve, 10000));
            const createdBot = await makeNewBot(botUsername, srvCfg, idx === 0);
            botList.push(createdBot);
        }
        (0, AutomaticEntryExit_1.initiateAutoCycle)(botList, srvCfg.bots, srvCfg.bots[0], (name, isMain) => makeNewBot(name, srvCfg, isMain));
    }
})();
