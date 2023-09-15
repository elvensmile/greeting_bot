import {Scenes, session, Telegraf} from "telegraf";
import { message } from "telegraf/filters";

import * as functions from "firebase-functions";

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
const betterRandom = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *  Utility function for mutating an array. If array length is larger
 *  than max parameter it removes the first element of array.
 *  Insert the item in the end of array.
 *
 * @param {T[]} arrForMutation
 * @param {T} item item for adding
 * @param {number} max - allowed length of the array
 */
const repliedIdsArray = <T>(arrForMutation: T[], item: T, max: number): void => {
    arrForMutation.length > max && arrForMutation.shift()
    arrForMutation.push(item)
}

/**
 * Get a greeting and replace name for user nickname
 * @param {string} userNickname
 * @returns {string}
 */
const getPersonalizedGreeting = (userNickname: string): string => {
    const randomGreeting =  greetings[betterRandom(0, greetings.length)];
    return randomGreeting
        .replace('{name}', `@${userNickname}`)
}

// endregion

const config = functions.config()

const BOT_TOKEN = config.telegram.token
const BOT_URL = config.telegram.url

const bot = new Telegraf<Scenes.SceneContext>(BOT_TOKEN);

const lastIds: number[] = []

bot.use(session());

bot.on(message('new_chat_members'), async (ctx) => {
    if (lastIds.includes(ctx.message.message_id)) {
        return;
    }

    repliedIdsArray(lastIds, ctx.message.message_id, 10)

    const newMembers = ctx.message.new_chat_members;
    await newMembers.forEach((member) => {
        const greetingMessage = getPersonalizedGreeting(member?.username ?? member?.first_name)
        ctx.reply(greetingMessage, {reply_to_message_id: ctx.message.message_id});
    });
});

bot.start((ctx) => ctx.reply(`Hey! I'm greeting bot!`));

bot.command('testme', (ctx) => {
    if (lastIds.includes(ctx.message.message_id)) {
        return;
    }
    repliedIdsArray(lastIds, ctx.message.message_id, 10)
    // @ts-ignore
    const userNickname = ctx?.message?.from?.username ?? '';
    if (userNickname) {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        const greetingMessage = randomGreeting
            .replace('{name}', `@${userNickname}`)
        // @ts-ignore
        ctx.reply(greetingMessage, {reply_to_message_id: ctx?.message?.message_id ?? ''});
    } else {
        ctx.reply('Hmmm, I must greet someone!');
    }
});

bot.telegram.setWebhook(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${BOT_URL}`)
exports.bot = functions.https.onRequest(
    (req, res) => bot.handleUpdate(req.body, res)
)
