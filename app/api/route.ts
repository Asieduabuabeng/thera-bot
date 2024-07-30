import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from 'crypto';

// Simulated session store (for development purposes)
const sessionStore: { [key: string]: { userData: string, currentWordIndex: number } } = {};

// Scrambled words data
const scrambledWords = [
  { word: "ASNAT LACSU", hint: "Unscramble to form a mythical person (often related to a holiday).", answer: "SANTA CLAUS" },
  { word: "AEPLPE", hint: "Unscramble to form a fruit (often red or green).", answer: "APPLE" },
  { word: "TELFRISEBTU", hint: "Unscramble to form a type of beautiful insect (often seen during Spring).", answer: "BUTTERFLY" },
  { word: "CEI RAMEC", hint: "Unscramble to form a type of snack (often kept frozen).", answer: "ICE CREAM" },
  { word: "LOREFSW", hint: "Unscramble to form an object part of nature (often used to show love or appreciation).", answer: "FLOWERS" }
];

const generateSessionId = () => randomBytes(16).toString('hex');

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return new NextResponse(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const contentType = req.headers.get("content-type");
    if (contentType !== "application/json") {
      return new NextResponse(
        JSON.stringify({ message: "Unsupported Media Type" }),
        {
          status: 415,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let data: any;
    try {
      const json = await req.text();  // Read the request body as a text
      console.log("Raw JSON string received:", json); // Debugging line
      data = JSON.parse(json);  // Parse the text to JSON
      console.log("Parsed JSON object:", data); // Debugging line
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("Invalid JSON data");
    }

    if (!data || typeof data !== 'object') {
      throw new Error("Invalid JSON data");
    }

    const ussd_id = data['USERID'];
    const msisdn = data['MSISDN'];
    const user_data = data['USERDATA'];
    const msgtype = data['MSGTYPE'];
    const network = data['NETWORK'] || "MTN";
    const sessionId = generateSessionId();

    console.log("Generated Session ID:", sessionId);

    let response = "";

    if (!sessionStore[sessionId]) {
      sessionStore[sessionId] = { userData: "", currentWordIndex: 0 };
    }

    console.log("Session Store:", sessionStore);

    // Handle different user_data inputs...
    // (Your existing logic here)

    return new NextResponse(JSON.stringify({
      USERID: ussd_id,
      MSISDN: msisdn,
      USERDATA: response,
      MSGTYPE: false,
      NETWORK: network
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(JSON.stringify({ message: "Invalid form data" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
