import { GoogleGenAI, Type } from "@google/genai";
import { Spot, OperationLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

export const generateWarehouseInsight = async (
  inventory: Spot[],
  logs: OperationLog[]
): Promise<string> => {
  try {
    // Summarize inventory for AI context to save tokens
    const occupied = inventory.filter(s => s.pallet !== null);
    const summary = occupied.reduce((acc, curr) => {
      const name = curr.pallet!.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentLogs = logs.slice(0, 10).map(l => `${l.type}: ${l.message}`).join('\n');

    const prompt = `
      You are an expert Warehouse Manager AI. Analyze the current state of a warehouse.
      
      Current Inventory Summary (Count by Product):
      ${JSON.stringify(summary, null, 2)}
      
      Occupancy: ${occupied.length} / ${inventory.length} spots used.
      
      Recent Operations:
      ${recentLogs}
      
      Provide a brief, strategic insight or optimization tip (max 2 sentences). 
      Focus on efficiency, space utilization, or potential bottlenecks based on the FIFO nature.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "No insights available at this moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Service currently unavailable.";
  }
};

export const chatWithInventory = async (
  query: string,
  inventory: Spot[]
): Promise<string> => {
  try {
     // Create a compact representation of the warehouse for the model
     const inventoryData = inventory
     .filter(s => s.pallet)
     .map(s => ({
       loc: `R${s.rackId}-L${s.rowId}`,
       item: s.pallet?.name,
       sku: s.pallet?.sku,
       inDate: s.pallet?.receivedAt.toISOString().split('T')[0]
     }));

    const systemInstruction = `
      You are an intelligent WMS Assistant. 
      The warehouse has 56 Racks, 5 Levels each.
      We follow FIFO (First-In, First-Out).
      
      Current Stock Data: ${JSON.stringify(inventoryData)}
      
      Answer the user's question about the stock. Be precise about locations (Rack/Row).
      If asked to find something, list the specific rack and row numbers.
      If asked about FIFO, identify which items should ship next (oldest dates).
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't process that query.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am having trouble connecting to the inventory database.";
  }
};

export const generateMockData = async (): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Generate 20 realistic warehouse pallets for a mixed general store warehouse.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sku: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
}