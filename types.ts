
export enum GameState {
  INTRO = 'INTRO',
  EXPLORING = 'EXPLORING',
  RESONANCE = 'RESONANCE',
  PURIFIED = 'PURIFIED',
  ENDING = 'ENDING'
}

export interface Point {
  x: number;
  y: number;
}

export interface InteractionPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  text: string;
  isCore?: boolean;
}

export interface Petal {
  id: number;
  x: number;
  y: number;
  speed: number;
  amplitude: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

export interface CollectionItem {
  id: string;
  title: string;
  reflection: string;
  timestamp: number;
}
