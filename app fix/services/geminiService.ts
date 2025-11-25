import { GoogleGenAI, Type } from "@google/genai";
import { Spot, OperationLog } from "../types";

// Initialize AI only if key exists to prevent immediate errors
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const modelId = "gemini-2.5-flash";

export const generateWarehouseInsight = async (
  inventory: Spot[],
  logs: OperationLog[]
): Promise<string> => {
  // Fallback Logic if AI is not available
  if (!ai) {
    const occupancy = inventory.filter(s => s.pallet !== null).length;
    const total = inventory.length;
    const rate = (occupancy / total) * 100;
    
    if (rate > 90) return "⚠️ Critical Capacity: Warehouse is over 90% full. Halt inbound shipments immediately.";
    if (rate > 75) return "Warning: Warehouse capacity is high. prioritizing outbound shipments is recommended.";
    if (rate < 10) return "Warehouse utilization is low. Ready for major inbound restocking.";
    return "System operating within normal parameters. Monitor FIFO compliance.";
  }

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
    return "AI Service currently unavailable. Please check API Key.";
  }
};

export const chatWithInventory = async (
  query: string,
  inventory: Spot[]
): Promise<string> => {
  if (!ai) {
    return "I cannot connect to the AI service. Please check if your API Key is configured correctly in the environment.";
  }

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

// Fallback static data if AI fails
const STATIC_MOCK_DATA = [
  { sku: 'ST-001', name: 'Steel Pipe', category: 'Construction', description: 'Heavy duty pipe' },
  { sku: 'ST-002', name: 'Copper Wire', category: 'Construction', description: 'Insulated wire' },
  { sku: 'EL-500', name: 'Power Drill', category: 'Tools', description: 'Cordless drill' },
  { sku: 'OF-101', name: 'Paper Ream', category: 'Office', description: 'A4 Paper' },
  { sku: 'OF-102', name: 'Stapler', category: 'Office', description: 'Heavy duty stapler' }
];

export const generateMockData = async (): Promise<any[]> => {
  if (!ai) {
    console.warn("Gemini API Key missing. Using static mock data.");
    return STATIC_MOCK_DATA;
  }

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
    console.error("Mock Data Generation Error:", e);
    return STATIC_MOCK_DATA;
  }
}