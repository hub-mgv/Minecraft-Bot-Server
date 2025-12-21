// Messages/Messages.ts
/*
This project is open source under MIT license.
Developer: mgv
X: @mgv15 ID: 1379675201616347259
GitHub: https://github.com/hub-mgv
Recommended hosting: wispbyte.com for free 24/7 Minecraft bot hosting.
Warning: This bot is for educational purposes only. Do not use for malicious activities. You are responsible for any bans or violations. The developer is not liable.
*/

import { Bot } from 'mineflayer';

export function beginRandomMessaging(myBot: Bot, msgList: string[], timeInterval: number) {
  setInterval(() => {
    if (msgList.length === 0) return;
    const randIdx = Math.floor(Math.random() * msgList.length);
    const selectedMsg = msgList[randIdx];
    myBot.chat(selectedMsg);
    console.log(`${myBot.username} sent a random msg: ${selectedMsg}`);
  }, timeInterval);
}