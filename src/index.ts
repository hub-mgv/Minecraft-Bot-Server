// index.ts
/*
This project is open source under MIT license.
Developer: mgv
GitHub: https://github.com/hub-mgv
discord Username: mgv150
Recommended hosting: wispbyte.com for free 24/7 Minecraft bot hosting.
Warning: This bot is for educational purposes only. Do not use for malicious activities. You are responsible for any bans or violations. The developer is not liable.
*/

import mineflayer from "mineflayer";
import { handleRuntimeCmd } from './commands/Runtime';
import antiafk from '@rhld16/mineflayer-antiafk';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { botLoginFunction } from './Account-Bots/login';
import { botRegisterFunction } from './Account-Bots/register';
import { beginRandomMessaging } from './Messages/Messages';
import { Authflow, Titles } from 'prismarine-auth';
import { initiateAutoCycle } from './AutomaticEntryExit';

interface SettingsConfig {
  servers: {
    Server: string;
    host: string;
    port?: number;
    version: string;
    bots: string[];
    autoAuth: {
      enabled: boolean;
      passwords: { [botUsername: string]: string };
    };
    randomChat: {
      enabled: boolean;
      interval: number;
      messages: string[];
    };
    auth: {
      enabled: boolean;
      type: 'microsoft' | 'offline';
      cacheBaseDir: string;
    };
    logging?: any;
  }[];
}

const settingsFilePath = path.join(__dirname, '../config/Settings.json');
const loadedConfig: SettingsConfig = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));

function createRandomPass(len = 12): string {
  const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let generatedPass = '';
  for (let i = 0; i < len; i++) {
    generatedPass += charSet.charAt(crypto.randomInt(0, charSet.length));
  }
  return generatedPass;
}

function fetchOrMakePass(username: string, authSettings: any): string {
  if (!authSettings.passwords[username]) {
    const newPass = createRandomPass();
    authSettings.passwords[username] = newPass;
    fs.writeFileSync(settingsFilePath, JSON.stringify(loadedConfig, null, 2));
  }
  return authSettings.passwords[username];
}

async function makeNewBot(username: string, srvSettings: any, isMainBot: boolean = false) {
  let botOpts: any = {
    host: srvSettings.host,
    port: srvSettings.port,
    version: srvSettings.version
  };

  const authenticationCfg = srvSettings.auth || { enabled: false, type: 'offline', cacheBaseDir: './authcache' };

  if (authenticationCfg.enabled && authenticationCfg.type === 'microsoft') {
    const cachePath = path.join(__dirname, '../', authenticationCfg.cacheBaseDir, username);
    const authOpts = {
      authTitle: Titles.MinecraftJava,
      flow: 'sisu',
      deviceType: 'Win32'
    } as const;
    const authHandler = new Authflow('', cachePath, authOpts);
    const tokenData = await authHandler.getMinecraftJavaToken({ fetchProfile: true });
    if (tokenData.profile.name !== username) {
      throw new Error(`Name mismatch: expected ${username} but got ${tokenData.profile.name}`);
    }
    botOpts.session = {
      accessToken: tokenData.token,
      profile: tokenData.profile
    };
  } else {
    botOpts.username = username;
  }

  const newBot = mineflayer.createBot(botOpts);

  newBot.on("login", () => console.log(`${username} connected`));
  newBot.on("spawn", () => {
    console.log(`${username} spawned`);
    newBot.chat(`Hello from ${username}`);

    if (isMainBot) {
      newBot.on('chat', (sender, incomingMsg) => {
        if (sender === newBot.username) return;
        handleRuntimeCmd(newBot, sender, incomingMsg);
      });
    }

    if (srvSettings.autoAuth.enabled) {
      newBot.on('message', (jsonMessage) => {
        const msgText = jsonMessage.toString().toLowerCase();
        const userPass = fetchOrMakePass(newBot.username, srvSettings.autoAuth);
        if (msgText.includes('/register')) {
          console.log(`${newBot.username} trying to register`);
          botRegisterFunction(newBot, userPass);
        } else if (msgText.includes('/login')) {
          console.log(`${newBot.username} trying to login`);
          botLoginFunction(newBot, userPass);
        }
      });
    }

    if (srvSettings.randomChat.enabled) {
      beginRandomMessaging(newBot, srvSettings.randomChat.messages, srvSettings.randomChat.interval);
    }

    newBot.loadPlugin(antiafk);
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
      if (idx > 0) await new Promise(resolve => setTimeout(resolve, 10000));
      const createdBot = await makeNewBot(botUsername, srvCfg, idx === 0);
      botList.push(createdBot);
    }

    initiateAutoCycle(botList, srvCfg.bots, srvCfg.bots[0], (name: string, isMain?: boolean) => makeNewBot(name, srvCfg, isMain));
  }
})();