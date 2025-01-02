export interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  scores?: {
    home: number;
    away: number;
  };
  status?: {
    long: string;
    short: string;
  };
}

export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
} 