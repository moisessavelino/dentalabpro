
import { GoogleGenAI } from "@google/genai";

// Inicializando o cliente GoogleGenAI usando process.env.API_KEY diretamente conforme as diretrizes
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartJobSuggestions = async (jobDetails: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Atue como um consultor técnico sênior de laboratório de prótese odontológica. 
      Com base nos seguintes detalhes do pedido: "${jobDetails}", 
      sugira os melhores materiais (ex: Zircônia, Dissilicato de Lítio, Cerâmica Feldspática), 
      cuidados especiais na usinagem ou queima, e uma estimativa de complexidade (Alta, Média, Baixa). 
      Responda de forma curta e profissional em português.`,
    });
    // Acessando a propriedade .text da resposta diretamente
    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Não foi possível obter sugestões inteligentes no momento.";
  }
};

export const analyzeFinancialTrends = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise estes dados financeiros de um laboratório de prótese: ${JSON.stringify(data)}. 
      Forneça 3 insights estratégicos para aumentar a rentabilidade ou reduzir prazos.`,
    });
    // Acessando a propriedade .text da resposta diretamente
    return response.text;
  } catch (error) {
    return "Análise indisponível.";
  }
}
