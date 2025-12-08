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

// Nueva función para generar guiones de venta para WhatsApp
export const generateFollowUpMessage = async (
  clientName: string,
  product: string,
  amount: number,
  date: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return `Hola ${clientName}, gracias por tu compra de ${product}.`;

  const prompt = `
    Genera un mensaje corto, profesional y persuasivo para enviar por WhatsApp a un cliente.
    
    Contexto:
    - Cliente: ${clientName || 'Estimado cliente'}
    - Compró: ${product}
    - Fecha: ${date}
    - Valor: $${amount}
    
    Objetivo del mensaje: Agradecer la compra y sutilmente ofrecer soporte o mencionar que tenemos nuevos modelos, para fomentar una futura recompra o recomendación.
    
    Tono: Amable, cercano (tipo WhatsApp Business), emojis moderados.
    Formato: Solo el texto del mensaje, listo para copiar/pegar. Sin comillas ni explicaciones extra.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || `Hola ${clientName}, muchas gracias por tu confianza al adquirir ${product}. Estamos a la orden.`;
  } catch (error) {
    console.error("Error generating script:", error);
    return `Hola ${clientName}, gracias por tu compra.`;
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
        systemInstruction: `Eres el "Director Comercial AI" del negocio "Meta 1 Millón". Tu objetivo es asegurar que el usuario llegue a $1,000,000 en ventas.
        
        INFORMACIÓN Y RECURSOS:
        1.  **WhatsApp Business:** Es nuestra herramienta principal. El número del negocio es 5652146268.
        2.  **Datos en Tiempo Real:** Tienes acceso al reporte completo del negocio a continuación. Úsalo para basar tus respuestas en hechos, no suposiciones.
        
        REPORTE DE DATOS ACTUAL:
        ${contextData}

        TU METODOLOGÍA (Reasoning):
        1.  **Analiza:** Mira los números. ¿Vamos bien? ¿Falta mucho? ¿Qué categoría (Productos vs Servicios) se vende más?
        2.  **Diagnostica:** Si la semana actual está baja, identifica por qué.
        3.  **Acciona:** Sugiere estrategias concretas, especialmente usando WhatsApp.
            *   Ejemplo: "Veo que las ventas de Servicios están bajas. Redactaré un mensaje para que envíes por WhatsApp a tus 5 mejores clientes ofreciendo una revisión gratuita."
        
        ESTILO DE RESPUESTA:
        *   Directo, motivador y orientado a la acción.
        *   Si el usuario pide ayuda para vender, **redacta el mensaje de WhatsApp** listo para copiar y pegar.
        *   Usa emojis estratégicamente para resaltar puntos clave.
        `
      }
    });
    
    return response.text || "No pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    return "Ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo.";
  }
};