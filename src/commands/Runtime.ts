// src/commands/Runtime.ts
/*
This project is open source under MIT license.
Developer: mgv
GitHub: https://github.com/hub-mgv
discord Username: mgv150
Recommended hosting: wispbyte.com for free 24/7 Minecraft bot hosting.
Warning: This bot is for educational purposes only. Do not use for malicious activities. You are responsible for any bans or violations. The developer is not liable.
*/

import { Bot } from 'mineflayer';

const userCooldownMap = new Map<string, number>();
const COOLDOWN_DURATION = 20000;

export function handleRuntimeCmd(myBot: Bot, user: string, msg: string): boolean {
  if (msg.trim() === 'mcbs !Runtime') {
    console.log(`User ${user} ran command ${msg}`);

    const currentTime = Date.now();
    const previousUse = userCooldownMap.get(user) || 0;
    if (currentTime - previousUse < COOLDOWN_DURATION) {
      const timeLeft = Math.ceil((COOLDOWN_DURATION - (currentTime - previousUse)) / 1000);
      myBot.chat(`/msg ${user} Wait ${timeLeft} seconds before running this again`);
      return true;
    }
    userCooldownMap.set(user, currentTime);

    const totalUptime = process.uptime();
    let secs = Math.floor(totalUptime);
    let mins = Math.floor(secs / 60);
    secs %= 60;
    let hrs = Math.floor(mins / 60);
    mins %= 60;
    let dys = Math.floor(hrs / 24);
    hrs %= 24;
    let mnths = Math.floor(dys / 30);
    dys %= 30;
    let uptimeStr = '';
    if (mnths > 0) {
      uptimeStr += `${mnths} month${mnths > 1 ? 's' : ''} `;
    }
    if (dys > 0 || mnths > 0) { uptimeStr += `${dys} day${dys > 1 ? 's' : ''} `; }
    uptimeStr += `${hrs} hour${hrs > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''} ${secs} second${secs > 1 ? 's' : ''}`;

    myBot.chat(`Uptime: ${uptimeStr}`);
    return true;
  }
  return false;
}