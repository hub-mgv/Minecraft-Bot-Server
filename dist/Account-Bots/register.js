"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.botRegisterFunction = botRegisterFunction;
function botRegisterFunction(myBot, passCode) {
    myBot.chat(`/register ${passCode} ${passCode}`);
    console.log(`${myBot.username} has registered using pass ${passCode}`);
}
