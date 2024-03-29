export type Game = "smashsp" | "smash4" | "melee";
export type Record = {
  tournamentId: number;
  opponentId: number;
  opponentName: string;
  myScore: number;
  opponentScore: number;
  roundStr: string;
};

export type Tournament = {
  id: number;
  name: string;
  date: string;
  finalRank: number | null;
  records: Record[];
};

export type TournamentIndex = {
  id: number;
  name: string;
  date: string;
  game: Game; 
};
export type TournamentsPerGame = {
  smashsp: Tournament[];
  smash4: Tournament[];
  melee: Tournament[];
};
export type PlayerJson = {
  playerData: {
    id: number;
    name: string;
  };
  tournamentsPerGame: TournamentsPerGame;
};

export type TournamentJson = {
  tournamentData: {
    name: string;
    url?: string;
    game: Game;
    date: string;
  };
  ranks: {
    rank: number;
    playerName: string;
    playerId: number;
    lostTo: number[]
  }[]
};