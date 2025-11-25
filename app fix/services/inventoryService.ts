import { db } from "./firebase";
import { collection, addDoc, deleteDoc, onSnapshot, doc, Timestamp, query, getDocs } from "firebase/firestore";
import { Pallet, Spot } from "../types";
import { TOTAL_RACKS, ROWS_PER_RACK } from "../constants";

const COLLECTION_NAME = "pallets";

// Helper to rebuild the full 56x5 grid from a list of pallets
const buildGrid = (pallets: Pallet[]): Spot[] => {
  const spots: Spot[] = [];
  
  // Create map for O(1) lookup
  const palletMap = new Map<string, Pallet>();
  pallets.forEach(p => palletMap.set(`${p.rackId}-${p.rowId}`, p));

  for (let r = 1; r <= TOTAL_RACKS; r++) {
    for (let l = 1; l <= ROWS_PER_RACK; l++) {
      const key = `${r}-${l}`;
      spots.push({
        rackId: r,
        rowId: l,
        pallet: palletMap.get(key) || null
      });
    }
  }
  return spots;
};

// --- API ---

// 1. Subscribe to Real-time Updates
export const subscribeToInventory = (onUpdate: (spots: Spot[]) => void) => {
  if (!db) {
    // Fallback: Return empty grid once if no DB
    onUpdate(buildGrid([]));
    return () => {};
  }

  const q = query(collection(db, COLLECTION_NAME));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const pallets: Pallet[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      pallets.push({
        id: doc.id,
        sku: data.sku,
        name: data.name,
        category: data.category,
        // Convert Firestore Timestamp to JS Date
        receivedAt: data.receivedAt instanceof Timestamp ? data.receivedAt.toDate() : new Date(data.receivedAt),
        rackId: data.rackId,
        rowId: data.rowId,
        description: data.description
      } as Pallet);
    });
    
    onUpdate(buildGrid(pallets));
  }, (error) => {
    console.error("Firestore Error:", error);
  });

  return unsubscribe;
};

// 2. Add Pallet (Receive)
export const addPalletToDB = async (pallet: Omit<Pallet, 'id'> & { rackId: number, rowId: number }) => {
  if (!db) return; // Offline mode handling
  
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...pallet,
      receivedAt: Timestamp.fromDate(pallet.receivedAt)
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// 3. Remove Pallet (Ship)
export const removePalletFromDB = async (palletId: string) => {
  if (!db) return;
  
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, palletId));
  } catch (e) {
    console.error("Error removing document: ", e);
    throw e;
  }
};
