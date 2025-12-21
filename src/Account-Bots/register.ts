// Account-Bots/register.ts
/*
This project is open source under MIT license.
Developer: mgv
GitHub: https://github.com/hub-mgv
discord Username: mgv150
Recommended hosting: wispbyte.com for free 24/7 Minecraft bot hosting.
Warning: This bot is for educational purposes only. Do not use for malicious activities. You are responsible for any bans or violations. The developer is not liable.
*/

import { Bot } from 'mineflayer';

export function botRegisterFunction(myBot: Bot, passCode: string) {
  myBot.chat(`/register ${passCode} ${passCode}`);
  console.log(`${myBot.username} has registered using pass ${passCode}`);
}