export interface EmailSection {
  text: string;
  imageKeyword: string; // Used to fetch a placeholder
  imagePosition: 'left' | 'right';
}

export interface EmailVersion {
  id: string;
  timestamp: number;
  sections: EmailSection[];
  subject: string;
  feedbackUsed: string;
  isSimulation?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface PautaData {
  title: string;
  content: string;
  useEmojis: boolean | null; // Changed to allow null (unselected state)
}