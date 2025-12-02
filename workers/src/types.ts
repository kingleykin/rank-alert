// Types cho Workers
export interface RankingItem {
  id: string;
  rankingId: string;
  position: number;
  itemId: string;
  itemName: string;
  itemImage?: string;
  score?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface RankingChange {
  itemId: string;
  itemName: string;
  oldPosition?: number;
  newPosition: number;
  change: 'up' | 'down' | 'new' | 'out' | 'same';
  changeAmount?: number;
}
