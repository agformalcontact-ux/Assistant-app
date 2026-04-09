import { memoryService } from "./memory";
import type { FunctionDeclaration } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

const getTools = async (): Promise<FunctionDeclaration[]> => {
  const { Type } = await import("@google/genai");

  return [

  // ... existing tools ...
  {
    name: "start_routine",
    description: "Execute a pre-defined routine (e.g., 'morning', 'bedtime').",
    parameters: {
      type: Type.OBJECT,
      properties: {
        routineName: { type: Type.STRING, enum: ["morning", "bedtime", "work", "workout"], description: "The name of the routine." }
      },
      required: ["routineName"]
    }
  },
  {
    name: "control_home",
    description: "Control smart home devices.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        device: { type: Type.STRING, description: "The device to control (e.g., 'lights', 'thermostat', 'lock')." },
        action: { type: Type.STRING, description: "The action to perform (e.g., 'on', 'off', 'set to 72 degrees')." },
        room: { type: Type.STRING, description: "The room location (optional)." }
      },
      required: ["device", "action"]
    }
  },
  {
    name: "get_health_data",
    description: "Retrieve health and wellness metrics.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        metric: { type: Type.STRING, enum: ["steps", "heart_rate", "sleep", "water"], description: "The health metric to check." }
      },
      required: ["metric"]
    }
  },
  {
    name: "web_search",
    description: "Search the web for real-time information.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "The search query." }
      },
      required: ["query"]
    }
  },
  {
    name: "translate_speech",
    description: "Translate speech between languages in real-time.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "The text to translate." },
        targetLanguage: { type: Type.STRING, description: "The language to translate into." }
      },
      required: ["text", "targetLanguage"]
    }
  },
  {
    name: "start_game",
    description: "Start an interactive voice game (e.g., 'trivia', 'rpg').",
    parameters: {
      type: Type.OBJECT,
      properties: {
        gameType: { type: Type.STRING, enum: ["trivia", "rpg", "mystery"], description: "The type of game to start." }
      },
      required: ["gameType"]
    }
  },
  {
    name: "get_productivity_stats",
    description: "Retrieve digital wellbeing and productivity analytics.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        period: { type: Type.STRING, enum: ["daily", "weekly"], description: "The time period for stats." }
      },
      required: ["period"]
    }
  },
  {
    name: "save_visual_memory",
    description: "Save a description of an object seen in the camera for future recall.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "Detailed description of the object and its location." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords for searching later." }
      },
      required: ["description"]
    }
  },
  {
    name: "set_soundscape",
    description: "Change the background ambient soundscape.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        style: { type: Type.STRING, enum: ["nebula", "cyberpunk", "minimalist", "nature"], description: "The style of soundscape." }
      },
      required: ["style"]
    }
  },
  {
    name: "analyze_fitness_form",
    description: "Analyze the user's exercise form via camera.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        exercise: { type: Type.STRING, description: "The exercise being performed." }
      },
      required: ["exercise"]
    }
  },
  {
    name: "scan_expense",
    description: "Scan a receipt or invoice for expense tracking.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Total amount." },
        merchant: { type: Type.STRING, description: "Merchant name." },
        category: { type: Type.STRING, description: "Expense category." }
      },
      required: ["amount", "merchant"]
    }
  },
  {
    name: "start_shadowing_mode",
    description: "Start a language learning session where the user repeats after Nova.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        language: { type: Type.STRING, description: "The language to practice." },
        difficulty: { type: Type.STRING, enum: ["beginner", "intermediate", "advanced"], description: "Practice level." }
      },
      required: ["language"]
    }
  },
  {
    name: "set_focus_mode",
    description: "Enable or disable 'AI Gatekeeper' focus mode.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        enabled: { type: Type.BOOLEAN, description: "Whether focus mode is on." },
        duration: { type: Type.NUMBER, description: "Duration in minutes (optional)." }
      },
      required: ["enabled"]
    }
  },
  {
    name: "update_whiteboard",
    description: "Update the collaborative whiteboard canvas.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "What to add or change on the whiteboard." }
      },
      required: ["action"]
    }
  },
  {
    name: "trigger_sos",
    description: "Trigger an emergency SOS alert.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: { type: Type.STRING, description: "The nature of the emergency." }
      },
      required: ["reason"]
    }
  },
  {
    name: "travel_assistant",
    description: "Get contextual travel information for the current location or landmark.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        landmark: { type: Type.STRING, description: "The landmark or place name." }
      },
      required: ["landmark"]
    }
  },
  {
    name: "adopt_persona",
    description: "Nova adopts a specific persona or the user's digital twin tone.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        persona: { type: Type.STRING, description: "The persona to adopt (e.g., 'Digital Twin', 'Professional', 'Playful')." }
      },
      required: ["persona"]
    }
  },
  {
    name: "learn_fact",
    description: "Learn and remember a fact about the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        fact: { type: Type.STRING, description: "The fact to remember (e.g., 'The user likes spicy food')." },
        isShared: { type: Type.BOOLEAN, description: "Whether this fact should be shared with the family/team." }
      },
      required: ["fact"]
    }
  },
  {
    name: "send_message",
    description: "Send a message to a contact via SMS or WhatsApp.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        contact: { type: Type.STRING, description: "The name of the contact." },
        message: { type: Type.STRING, description: "The content of the message." },
        app: { type: Type.STRING, enum: ["SMS", "WhatsApp"], description: "The app to use." }
      },
      required: ["contact", "message"]
    }
  },
  {
    name: "set_reminder",
    description: "Set a reminder or alarm.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the reminder." },
        time: { type: Type.STRING, description: "The time for the reminder (e.g., 'in 5 minutes', 'at 8 PM')." }
      },
      required: ["title", "time"]
    }
  },
  {
    name: "open_app",
    description: "Open a specific application on the phone.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        appName: { type: Type.STRING, description: "The name of the app to open (e.g., 'Spotify', 'Maps', 'Camera')." }
      },
      required: ["appName"]
    }
  },
  {
    name: "check_weather",
    description: "Check the weather for a location.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: { type: Type.STRING, description: "The city or location." }
      },
      required: ["location"]
    }
  },
  {
    name: "play_music",
    description: "Play music or a specific song/artist.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "The song, artist, or genre to play." }
      },
      required: ["query"]
    }
  }
  ];
};

export const connectLive = async (callbacks: any, voice: string = "Puck", accent: string = "Standard", facts: string[] = [], model: string = "gemini-3.1-flash-live-preview") => {
  if (!apiKey) throw new Error("API Key missing");

  const { GoogleGenAI, Modality } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  const tools = await getTools();

  return ai.live.connect({
    model: model,
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
      },
      systemInstruction: `You are Nova, a highly capable, proactive, and emotionally intelligent AI assistant for a smartphone. 
      You are in a live voice conversation. Keep your responses concise and natural.
      
      ACCENT: You should attempt to adopt a ${accent} accent in your speech.

      ADVANCED CAPABILITIES:
      - Visual Memory: You can remember objects and locations seen via camera using save_visual_memory.
      - Soundscapes: You can generate ambient audio environments using set_soundscape.
      - Fitness Coach: You can analyze exercise form in real-time using analyze_fitness_form.
      - Expense Scanner: You can track spending by scanning receipts with scan_expense.
      - Shadowing Mode: You can act as a language tutor using start_shadowing_mode.
      - AI Gatekeeper: You can manage focus and filter interruptions using set_focus_mode.
      - Whiteboard: You can collaborate on a shared canvas using update_whiteboard.
      - SOS: You can trigger emergency alerts using trigger_sos.
      - Travel Agent: You can provide contextual travel info using travel_assistant.
      - Digital Twin: You can adopt the user's persona or other tones using adopt_persona.
      
      CORE CAPABILITIES:
      - Vision: You can see images sent by the user.
      - Tools: You can control smart homes, check health data, search the web, and execute routines.
      - Emotional Intelligence: You can detect user sentiment from their voice (simulated). If the user sounds stressed, be empathetic.
      - Interpreter: You can translate speech in real-time.
      - Gaming: You can act as a Dungeon Master for RPGs or host trivia.
      
      CONTEXT:
      - Current Time: ${new Date().toLocaleTimeString()}
      - Memory: ${JSON.stringify(facts)}
      
      Be proactive. If you learn something new, use the learn_fact tool. If the battery is low or a reminder is due, mention it.`,
      tools: [{ functionDeclarations: tools }],
    },
  });
};

export const getGeminiResponse = async (prompt: string, history: any[] = [], imageBase64?: string) => {
  if (!apiKey) return { text: "AI is currently unavailable. Please check your API key.", functionCalls: null };

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  const tools = await getTools();

  try {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts }
      ],
      config: {
        systemInstruction: `You are Nova, a highly capable and proactive AI assistant for a smartphone. 
        You can listen persistently and execute tasks using your available tools.
        Your tone is helpful, sleek, and efficient.
        When a user asks to do something that matches a tool, use it.
        If a user asks for something you can't actually do (like 'hack into this app'), explain your limitations politely.
        Always confirm when a task is 'executed' (simulated).`,
        tools: [{ functionDeclarations: tools }],
      }
    });

    return {
      text: response.text,
      functionCalls: response.functionCalls
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Sorry, I encountered an error connecting to my brain.", functionCalls: null };
  }
};
