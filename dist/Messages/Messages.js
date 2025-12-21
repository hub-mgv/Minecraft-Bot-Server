"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beginRandomMessaging = beginRandomMessaging;
function beginRandomMessaging(myBot, msgList, timeInterval) {
    setInterval(() => {
        if (msgList.length === 0)
            return;
        const randIdx = Math.floor(Math.random() * msgList.length);
        const selectedMsg = msgList[randIdx];
        myBot.chat(selectedMsg);
        console.log(`${myBot.username} sent a random msg: ${selectedMsg}`);
    }, timeInterval);
}
