"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateAutoCycle = initiateAutoCycle;
function initiateAutoCycle(botArray, botUsernames, mainBotName, botCreatorFunc) {
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
