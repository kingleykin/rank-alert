// Shared types cho toàn bộ dự án

export interface RankingSource {
  id: string;
  name: string;
  type: 'vieon' | 'youtube' | 'tiktok' | 'spotify';
  url: string;
}

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

export interface Subscription {
  id: string;
  userId: string;
  rankingId: string;
  notifyOnChange: boolean;
  createdAt: string;
}
