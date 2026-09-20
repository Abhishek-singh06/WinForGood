export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  score_date: string; // ISO date string YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface ScoreActionResponse {
  success: boolean;
  error?: string;
  score?: GolfScore;
}
