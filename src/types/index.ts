export interface City {
  name: string;
  lat: number;
  lng: number;
}

export interface GameState {
  points: number;
  hintCount: number;
  hints: string[];
  targetCity: City | null;
  guessedCity: string | null;
  gameOver: boolean;
  gameResult: 'win' | 'lose' | null;
}