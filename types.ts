
export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  name: string;
  pos: Vector2;
  targetPos: Vector2;
  color: string;
  bubbleText?: string;
  bubbleTimer: number;
  isPlayer?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}
