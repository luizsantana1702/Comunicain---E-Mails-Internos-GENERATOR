import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EmailVersion, EmailSection } from "../types";

// Define the response schema for structured output
const emailSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "A catchy subject line for the internal email.",
    },
    sections: {
      type: Type.ARRAY,
      description: "List of content sections for the email.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The paragraph text. Must be strictly 1 or 2 sentences max. Professional yet engaging tone.",
          },
          imageKeyword: {
            type: Type.STRING,
            description: "A specific directive for the visual editor (e.g., 'GIF de equipe comemorando', 'Foto do palestrante sorrindo').",
          },
          imagePosition: {
            type: Type.STRING,
            description: "Layout preference: 'left' or 'right'.",
            enum: ["left", "right"],
          },
        },
        required: ["text", "imageKeyword", "imagePosition"],
      },
    },
  },
  required: ["subject", "sections"],
};

// --- MOCK GENERATOR FOR FREE MODE ---
const generateMockVersion = (pauta: string, feedback: string, useEmojis: boolean): Omit<EmailVersion, "id" | "timestamp" | "feedbackUsed"> & { isSimulation: boolean } => {
  // Simple heuristic to split text into "sections"
  const paragraphs = pauta.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  const emojis = ["🚀", "✨", "💡", "👏", "🔥", "🤝"];
  const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

  const sections: EmailSection[] = paragraphs.slice(0, 4).map((para, index) => {
    let textContent = para.length > 200 ? para.substring(0, 197) + "..." : para;
    
    // Add mock emojis if requested
    if (useEmojis) {
      textContent = `${getRandomEmoji()} ${textContent} ${getRandomEmoji()}`;
    }

    return {
      text: textContent,
      imageKeyword: index % 2 === 0 
        ? "Inserir GIF animado de pessoas comemorando (High-five) ou colaborando." 
        : "Colocar foto oficial da campanha ou gráfico com os dados mencionados.",
      imagePosition: index % 2 === 0 ? 'right' : 'left'
    };
  });

  // Fallback if pauta is too short
  if (sections.length === 0) {
    sections.push({
      text: useEmojis 
        ? "✨ " + (pauta || "Conteúdo da pauta aparecerá aqui formatado.") + " 🚀"
        : pauta || "Conteúdo da pauta aparecerá aqui formatado.",
      imageKeyword: "Inserir banner principal da campanha com a cor roxa do Comunicain.",
      imagePosition: "right"
    });
  }

  return {
    subject: `[RASCUNHO SIMULADO] ${pauta.substring(0, 30)}... ${useEmojis ? '✨' : ''}`,
    sections: sections,
    isSimulation: true
  };
};

export const generateEmailVersion = async (
  pauta: string,
  feedback: string,
  currentHistory: string,
  useEmojis: boolean
): Promise<Omit<EmailVersion, "id" | "timestamp" | "feedbackUsed"> & { isSimulation?: boolean }> => {
  
  // 1. Check if API Key exists. If not, return Mock.
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Using Simulation Mode.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
    return generateMockVersion(pauta, feedback, useEmojis);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    You are an expert Internal Communications Editor for Sebrae.
    
    VISUAL IDENTITY & TONE:
    - Tone: Professional, encouraging, modern.
    - Context: Internal email (Comunicain).

    STRICT FORMATTING RULES:
    1. Structure: Break email into sections.
    2. Layout: Text + Visual Directive.
    3. Length: Each text block MUST contain exactly 1 or 2 sentences.
    4. **ImageKeyword**: This is NOT for search engines. It is a DIRECTIVE for a human designer. Example: "Colocar GIF de pessoas dando Highfive", "Usar foto do evento em anexo", "Inserir gráfico de pizza com os dados".
    5. Variables: Use {{NOME}} for placeholders.
    6. EMOJI USAGE: ${useEmojis ? "MANDATORY. Use relevant emojis in every paragraph to make it lively." : "FORBIDDEN. Do not use any emojis. Keep it strictly clean text."}

    INPUTS:
    - Pauta: Raw info.
    - Feedback: User adjustments.
  `;

  const userPrompt = `
    PAUTA: ${pauta}
    FEEDBACK: ${feedback || "Generate initial draft."}
    HISTORY: ${currentHistory}
    EMOJI PREFERENCE: ${useEmojis ? "YES" : "NO"}
    
    Return JSON based on schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: emailSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return {
      subject: data.subject,
      sections: data.sections,
      isSimulation: false
    };
  } catch (error) {
    console.error("Gemini API Error (Falling back to mock):", error);
    // Fallback to mock if API fails (e.g., quota exceeded or invalid key)
    return generateMockVersion(pauta, feedback, useEmojis);
  }
};