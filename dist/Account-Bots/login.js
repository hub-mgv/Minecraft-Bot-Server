"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.botLoginFunction = botLoginFunction;
function botLoginFunction(myBot, passCode) {
    myBot.chat(`/login ${passCode}`);
    console.log(`${myBot.username} has logged in using pass ${passCode}`);
}
