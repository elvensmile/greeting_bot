"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const functions = require("firebase-functions");
// region your greetings, free to modify
const greetings = [
    "Hey there, {name}! Do you prefer pancakes or waffles?",
    "Well, hello, {name}! What's the weirdest food combination you've ever tried?",
    "{name}! If you could have any superpower, what would it be and why?",
    "Hey, {name}! What's the funniest joke you've ever heard?",
    "Greetings, {name}! If you were a vegetable, what vegetable would you be and why?",
    "Yo, {name}! What's your favorite dad joke?",
    "Hello, {name}! If you could be any fictional character for a day, who would you choose?",
    "{name}! If you were stranded on a deserted island, what three things would you want with you?"
];
// endregion
// region utility
/**
 * A bit better random than Math.random(). Returns a number inside the range.
 * @param {number} min start of the range
 * @param {number} max end of the range
 * @returns {number}
 */
const betterRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
/**
 *  Utility function for mutating an array. If array length is larger
 *  than max parameter it removes the first element of array.
 *  Insert the item in the end of array.
 *
 * @param {T[]} arrForMutation
 * @param {T} item item for adding
 * @param {number} max - allowed length of the array
 */
const repliedIdsArray = (arrForMutation, item, max) => {
    arrForMutation.length > max && arrForMutation.shift();
    arrForMutation.push(item);
};
/**
 * Get a greeting and replace name for user nickname
 * @param {string} userNickname
 * @returns {string}
 */
const getPersonalizedGreeting = (userNickname) => {
    const randomGreeting = greetings[betterRandom(0, greetings.length)];
    return randomGreeting
        .replace('{name}', `@${userNickname}`);
};
// endregion
const config = functions.config();
const BOT_TOKEN = config.telegram.token;
const BOT_URL = config.telegram.url;
const bot = new telegraf_1.Telegraf(BOT_TOKEN);
const lastIds = [];
bot.use((0, telegraf_1.session)());
bot.on((0, filters_1.message)('new_chat_members'), async (ctx) => {
    if (lastIds.includes(ctx.message.message_id)) {
        return;
    }
    repliedIdsArray(lastIds, ctx.message.message_id, 10);
    const newMembers = ctx.message.new_chat_members;
    await newMembers.forEach((member) => {
        var _a;
        const greetingMessage = getPersonalizedGreeting((_a = member === null || member === void 0 ? void 0 : member.username) !== null && _a !== void 0 ? _a : member === null || member === void 0 ? void 0 : member.first_name);
        ctx.reply(greetingMessage, { reply_to_message_id: ctx.message.message_id });
    });
});
bot.start((ctx) => ctx.reply(`Hey! I'm greeting bot!`));
bot.command('testme', (ctx) => {
    var _a, _b, _c, _d, _e;
    if (lastIds.includes(ctx.message.message_id)) {
        return;
    }
    repliedIdsArray(lastIds, ctx.message.message_id, 10);
    // @ts-ignore
    const userNickname = (_c = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.message) === null || _a === void 0 ? void 0 : _a.from) === null || _b === void 0 ? void 0 : _b.username) !== null && _c !== void 0 ? _c : '';
    if (userNickname) {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        const greetingMessage = randomGreeting
            .replace('{name}', `@${userNickname}`);
        // @ts-ignore
        ctx.reply(greetingMessage, { reply_to_message_id: (_e = (_d = ctx === null || ctx === void 0 ? void 0 : ctx.message) === null || _d === void 0 ? void 0 : _d.message_id) !== null && _e !== void 0 ? _e : '' });
    }
    else {
        ctx.reply('Pew!');
    }
});
bot.telegram.setWebhook(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${BOT_URL}`);
exports.bot = functions.https.onRequest((req, res) => bot.handleUpdate(req.body, res));
//# sourceMappingURL=index.js.map