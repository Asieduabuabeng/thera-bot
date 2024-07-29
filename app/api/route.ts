import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { parse } from 'querystring'; // Import querystring parser

type GameData = {
  currentWordIndex: number;
};

const gameData: { [key: string]: GameData } = {};

const scrambledWords = [
  { word: "ASNAT LACSU", hint: "Unscramble to form a mythical person (often related to a holiday).", answer: "SANTA CLAUS" },
  { word: "AEPLPE", hint: "Unscramble to form a fruit (often red or green).", answer: "APPLE" },
  { word: "TELFRISEBTU", hint: "Unscramble to form a type of beautiful insect (often seen during Spring).", answer: "BUTTERFLY" },
  { word: "CEI RAMEC", hint: "Unscramble to form a type of snack (often kept frozen).", answer: "ICE CREAM" },
  { word: "LOREFSW", hint: "Unscramble to form an object part of nature (often used to show love or appreciation).", answer: "FLOWERS" }
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Content-Type", "application/json");
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    // Parse the form data
    const data = await new Promise<{ [key: string]: string }>((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        resolve(parse(body) as { [key: string]: string });
      });
      req.on('error', reject);
    });

    const sessionId = data.sessionId;
    const serviceCode = data.serviceCode;
    const phoneNumber = data.phoneNumber;
    const text = data.text;
    const textArray = text.split("*");

    let response = "";

    // Start session management
    const hashedPhoneNumber = crypto.createHash('md5').update(phoneNumber).digest('hex');
    if (!gameData[hashedPhoneNumber]) {
      gameData[hashedPhoneNumber] = { currentWordIndex: 0 };
    }

    if (text === "") {
      response = `CON Hi, welcome. Your mental health is a priority. Don't be afraid to seek help.\n1. Suicide and Crisis\n2. Telephone Counselling\n3. Play a Game`;
    } else if (text === "1") {
      response = `CON Suicide and Crisis Hotlines:\n1. Ambulance\n2. Emergency number\n3. Suicide Hotline\n4. Fire Service\n5. Police\n0. Back`;
    } else if (text === "1*1") {
      response = `END Please dial 193 for Ambulance services.`;
    } else if (text === "1*2") {
      response = `END Please dial 999 for Emergency services.`;
    } else if (text === "1*3") {
      response = `END Please dial +233 24 447 1279 for Suicide Hotline.`;
    } else if (text === "1*4") {
      response = `END Please dial 192 for Fire Service.`;
    } else if (text === "1*5") {
      response = `END Please dial 191 for Police.`;
    } else if (text === "2") {
      response = `CON Telephone Counselling Hotlines:\n1. Greater Accra Region\n2. Ashanti Region\n3. Western Region\n4. Brong Ahafo Region\n5. Northern Region\n0. Back`;
    } else if (text === "2*1") {
      response = `END Please dial 030 266 2441 for Greater Accra Region.`;
    } else if (text === "2*2") {
      response = `END Please dial 032 202 2323 for Ashanti Region.`;
    } else if (text === "2*3") {
      response = `END Please dial 031 204 6121 for Western Region.`;
    } else if (text === "2*4") {
      response = `END Please dial 035 202 7083 for Brong Ahafo Region.`;
    } else if (text === "2*5") {
      response = `END Please dial 037 202 2889 for Northern Region.`;
    } else if (text === "3") {
      response = `CON Games:\n1. Word Scramble\n2. Free Web Games\n3. Free Web Comics/Stories\n0. Back`;
    } else if (text === "3*1") {
      const userGame = gameData[hashedPhoneNumber];
      const currentWord = scrambledWords[userGame.currentWordIndex];

      if (currentWord) {
        response = `CON Word Scramble:\nHint: ${currentWord.hint}\nScrambled Word: ${currentWord.word}`;
      } else {
        response = `END No more words to scramble.`;
      }
    } else if (text.startsWith("3*1*")) {
      const userGame = gameData[hashedPhoneNumber];
      const currentWord = scrambledWords[userGame.currentWordIndex];
      const answer = textArray[textArray.length - 1]; // Extract the user's answer from the last part of the text array

      if (answer.toUpperCase() === currentWord.answer.toUpperCase()) {
        userGame.currentWordIndex += 1;

        if (userGame.currentWordIndex < scrambledWords.length) {
          const nextWord = scrambledWords[userGame.currentWordIndex];
          response = `CON Correct! Next word:\nHint: ${nextWord.hint}\nScrambled Word: ${nextWord.word}`;
        } else {
          response = `END You've completed all the words!`;
        }
      } else {
        response = `CON Incorrect. Try again:\nHint: ${currentWord.hint}\nScrambled Word: ${currentWord.word}`;
      }
    } else if (text === "3*2") {
      response = `END Visit the following URLs for free web games:\n1. https://www.miniclip.com\n2. https://www.kongregate.com\n3. https://www.crazygames.com`;
    } else if (text === "3*3") {
      response = `END Visit the following URLs for free web comics/stories:\n1. https://www.webtoons.com\n2. https://www.tapas.io\n3. https://www.shortstories.com`;
    } else if (text === "0") {
      response = `CON Hi, welcome. Your mental health is a priority. Don't be afraid to seek help.\n1. Suicide and Crisis\n2. Telephone Counselling\n3. Play a Game`;
    } else {
      response = `END Invalid Choice.`;
    }

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.setHeader("Content-Type", "application/json");
    res.status(400).json({ message: "Invalid form data" });
  }
};

export default handler;
