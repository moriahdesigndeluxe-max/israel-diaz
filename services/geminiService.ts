import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. Gemini features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMotivationalTip = async (
  currentTotal: number,
  goal: number,
  daysRemaining: number
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Mantén el enfoque y sigue registrando tus ventas. ¡Tú puedes!";

  const percentage = ((currentTotal / goal) * 100).toFixed(1);

  const prompt = `
    Actúa como un consultor de negocios experto y motivador.
    El usuario tiene una meta de ventas de $${goal.toLocaleString()}.
    Actualmente ha recaudado $${currentTotal.toLocaleString()} (${percentage}%).
    Quedan ${daysRemaining} días para finalizar el periodo de 4 semanas.
    
    Dame un consejo breve (máximo 2 frases), estratégico y motivacional para ayudarles a alcanzar la meta.
    Si van retrasados, enfócate en acciones de alto impacto. Si van bien, enfócate en mantener el momentum.
    No uses markdown, solo texto plano.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "¡Cada venta cuenta! Sigue empujando hacia la meta.";
  } catch (error) {
    console.error("Error generating tip:", error);
    return "Revisa tus estrategias de cierre y contacta a tus mejores clientes hoy.";
  }
};

export const chatWithGemini = async (
  message: string,
  contextData: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Lo siento, no puedo procesar tu solicitud sin una API Key válida.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: {
        thinkingConfig: {
          thinkingBudget: 32768, // Max budget for deep reasoning
        },
        systemInstruction: `Eres un asistente inteligente experto en ventas y análisis de datos para la aplicación "Meta 1 Millón".
        
        CONTEXTO ACTUAL DE LA CAMPAÑA:
        ${contextData}

        TU OBJETIVO:
        Ayudar al usuario a analizar su progreso, sugerir estrategias de venta, calcular proyecciones y resolver dudas complejas sobre su desempeño.
        
        INSTRUCCIONES:
        1. Utiliza tu capacidad de razonamiento profundo (Thinking Mode) para analizar los datos antes de responder.
        2. Sé empático pero orientado a resultados.
        3. Da respuestas claras y accionables.
        4. Si te piden cálculos, explica brevemente tu razonamiento.
        `
      }
    });
    
    return response.text || "No pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    return "Ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo.";
  }
};