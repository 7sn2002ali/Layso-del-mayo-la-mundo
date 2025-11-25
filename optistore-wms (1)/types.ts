export interface Pallet {
  id: string;
  sku: string;
  name: string;
  category: string;
  receivedAt: Date;
  description?: string;
  // We add location to the Pallet object itself for easier DB persistence
  rackId?: number;
  rowId?: number;
}

export interface Spot {
  rackId: number; // 1 to 56
  rowId: number;  // 1 to 5 (Level)
  pallet: Pallet | null;
}

export interface WarehouseStats {
  totalCapacity: number;
  usedCapacity: number;
  occupancyRate: number;
  uniqueSkus: number;
}

export interface OperationLog {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ERROR' | 'AI_INSIGHT';
  message: string;
  timestamp: Date;
  details?: string;
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  AI_ASSISTANT = 'AI_ASSISTANT'
}
