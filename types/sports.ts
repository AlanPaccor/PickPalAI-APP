export interface Game {
  id: string;
  player: string;
  position: string;
  team: string;
  opponent: string;
  prediction: string;
  stat: string;
  popularity: string;
  time: string;
  jersey: string;
  jerseyColor: string;
  sport_key?: string;
  sport_title?: string;
  commence_time?: string;
  home_team?: string;
  away_team?: string;
  sport: string;
}

export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
} 