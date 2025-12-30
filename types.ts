
export interface TripItem {
  id: string;
  time: string;
  activity: string;
  location: string;
  type: 'food' | 'transport' | 'sightseeing' | 'hotel';
  bookingRef?: string;
  notes?: string;
  completed: boolean;
}

export interface DayPlan {
  id: string;
  date: string;
  items: TripItem[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
  model: string;
}

export interface TripProject {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  itinerary: DayPlan[];
  bannerUrl?: string;
  chats?: ChatSession[];
}

export interface CurrencyData {
  jpyToHkd: number;
  jpyToTwd: number;
  lastUpdated: string;
}
