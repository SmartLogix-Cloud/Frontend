import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

let client: GoogleGenAI | null = null;

/** Indica si Gemini está configurado (hay API key disponible). */
export function isGeminiEnabled(): boolean {
  return Boolean(apiKey);
}

function getClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error('Gemini no configurado: define VITE_GEMINI_API_KEY.');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Genera una respuesta de texto libre a partir de un prompt.
 * @param prompt Texto del usuario / consulta.
 * @param systemInstruction Instrucción de sistema opcional (contexto/persona).
 */
export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    ...(systemInstruction ? { config: { systemInstruction } } : {}),
  });
  return response.text ?? '';
}

/**
 * Genera y parsea una respuesta JSON estructurada.
 * Lanza si la respuesta no es JSON válido.
 * @param prompt Prompt que describe el JSON esperado.
 */
export async function generateJson<T>(prompt: string): Promise<T> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  const text = response.text ?? '';
  return JSON.parse(text) as T;
}
