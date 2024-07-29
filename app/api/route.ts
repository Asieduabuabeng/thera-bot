import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Define types for the incoming request data
interface RequestData {
  USERID: string;
  MSISDN: string;
  USERDATA: string;
  MSGTYPE: boolean;
}

// Define a type for session data
interface SessionData {
  userId: string;
  msisdn: string;
  userData: string;
  msgType: boolean;
}

// A simple in-memory session store (this should be replaced with a proper persistent store in production)
const sessionStore: { [key: string]: string } = {};

// Generate a session ID based on the MSISDN
function generateSessionId(msisdn: string): string {
  return crypto.createHash("md5").update(msisdn).digest("hex");
}

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

    // Parse the JSON request body
    const requestBody = await req.json();
    const data: RequestData = requestBody as RequestData;

    const { USERID, MSISDN, USERDATA, MSGTYPE } = data;
    const sessionId = generateSessionId(MSISDN);

    // Retrieve or initialize session data
    let sessionData = sessionStore[sessionId] || "";

    // Handle subsequent dials
    if (sessionData && !MSGTYPE) {
      sessionData += USERDATA;
      const userDials = sessionData.split("#*#");
      const msg = `Hello ${userDials[1]}, Your initial dial was ${userDials[0]}\nInputs were successfully stored and passed on to this screen.\nHappy Coding :)`;
      const resp = { USERID, MSISDN, USERDATA, MSG: msg, MSGTYPE: false };
      sessionStore[sessionId] = ""; // Clear session data after use
      return new NextResponse(JSON.stringify(resp), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      // Reinitialize session variable if the user cancelled initial screen
      if (sessionData && MSGTYPE) {
        sessionData = "";
      }

      // Store user inputs using sessions
      sessionData = USERDATA + "#*#";
      sessionStore[sessionId] = sessionData;

      // USSD logic
      const textArray = USERDATA.split("*");
      let response = "";

      if (USERDATA === "") {
        response = `CON Hi, welcome. Your mental health is a priority. Don't be afraid to seek help.\n1. Suicide and Crisis\n2. Telephone Counselling\n3. Play a Game`;
      } else if (USERDATA === "1") {
        response = `CON Suicide and Crisis Hotlines:\n1. Ambulance\n2. Emergency number\n3. Suicide Hotline\n4. Fire Service\n5. Police\n0. Back`;
      } else if (USERDATA === "1*1") {
        response = `END Please dial 193 for Ambulance services.`;
      } else if (USERDATA === "1*2") {
        response = `END Please dial 999 for Emergency services.`;
      } else if (USERDATA === "1*3") {
        response = `END Please dial +233 24 447 1279 for Suicide Hotline.`;
      } else if (USERDATA === "1*4") {
        response = `END Please dial 192 for Fire Service.`;
      } else if (USERDATA === "1*5") {
        response = `END Please dial 191 for Police.`;
      } else if (USERDATA === "2") {
        response = `CON Telephone Counselling Hotlines:\n1. Greater Accra Region\n2. Ashanti Region\n3. Western Region\n4. Brong Ahafo Region\n5. Northern Region\n0. Back`;
      } else if (USERDATA === "2*1") {
        response = `END Please dial 030 266 2441 for Greater Accra Region.`;
      } else if (USERDATA === "2*2") {
        response = `END Please dial 032 202 2323 for Ashanti Region.`;
      } else if (USERDATA === "2*3") {
        response = `END Please dial 031 204 6121 for Western Region.`;
      } else if (USERDATA === "2*4") {
        response = `END Please dial 035 202 7083 for Brong Ahafo Region.`;
      } else if (USERDATA === "2*5") {
        response = `END Please dial 037 202 2889 for Northern Region.`;
      } else if (USERDATA === "3") {
        response = `CON Games:\n1. Word Scramble\n2. Free Web Games\n3. Free Web Comics/Stories\n0. Back`;
      } else if (USERDATA === "3*1") {
        response = `END Please dial your Word Scramble game logic here.`;
      } else if (USERDATA === "3*2") {
        response = `END Visit the following URLs for free web games:\n1. https://www.miniclip.com\n2. https://www.kongregate.com\n3. https://www.crazygames.com`;
      } else if (USERDATA === "3*3") {
        response = `END Visit the following URLs for free web comics/stories:\n1. https://www.webtoons.com\n2. https://www.tapas.io\n3. https://www.shortstories.com`;
      } else if (USERDATA === "0") {
        response = `CON Hi, welcome. Your mental health is a priority. Don't be afraid to seek help.\n1. Suicide and Crisis\n2. Telephone Counselling\n3. Play a Game`;
      } else {
        response = `END Invalid Choice.`;
      }

      const resp = { USERID, MSISDN, USERDATA, MSG: response, MSGTYPE: true };
      return new NextResponse(JSON.stringify(resp), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
