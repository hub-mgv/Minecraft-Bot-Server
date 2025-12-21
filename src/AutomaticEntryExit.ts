// AutomaticEntryExit.ts
/*
This project is open source under MIT license.
Developer: mgv
X: @mgv15 ID: 1379675201616347259
GitHub: https://github.com/hub-mgv
Recommended hosting: wispbyte.com for free 24/7 Minecraft bot hosting.
Warning: This bot is for educational purposes only. Do not use for malicious activities. You are responsible for any bans or violations. The developer is not liable.
*/

import { Bot } from 'mineflayer';

export function initiateAutoCycle(
  botArray: Bot[],
  botUsernames: string[],
  mainBotName: string,
  botCreatorFunc: (username: string, isMain: boolean) => Promise<Bot>
) {
  const shortestDelay = 4 * 60 * 60 * 1000;
  const longestDelay = 5 * 60 * 60 * 1000;
  async function runOneCycle() {
    const idxList = [...Array(botUsernames.length).keys()];
    for (let i = idxList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxList[i], idxList[j]] = [idxList[j], idxList[i]];
    }

    for (const currentIdx of idxList) {
      const currentUsername = botUsernames[currentIdx];
      console.log(`Disconnecting ${currentUsername} for 15 secs`);
      botArray[currentIdx].end();

      await new Promise(resolve => setTimeout(resolve, 15000));

      console.log(`Reconnecting ${currentUsername}`);
      const isMainBot = currentUsername === mainBotName;
      botArray[currentIdx] = await botCreatorFunc(currentUsername, isMainBot);
    }
    console.log('Finished cycle for every bot');
  }

  function planNextCycle() {
    const randomDelay = Math.random() * (longestDelay - shortestDelay) + shortestDelay;
    console.log(`Scheduling next cycle in about ${Math.round(randomDelay / 3600000)} hours`);
    setTimeout(async () => {
      await runOneCycle();
      planNextCycle();
    }, randomDelay);
  }

  planNextCycle();
}