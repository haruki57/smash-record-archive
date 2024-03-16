import { PrismaClient } from "@prisma/client";

// This script is almost copy of FinalRankAdderFromRecord.java in smash-record-tools
// re-implement this to insert ranks for tournament:64 (umebura14b)

const ranksForDoubleElimi = new Array(30); // [3, 4, 5, 7, 9, 13, 17, 25, 33, 49...]
const ranksForSingleElimi = new Array(30); // [3, 5, 9, 17, 33, 65...]

function init(){
  for (let i = 0; i < ranksForDoubleElimi.length; i++) {
    const j = ((i + 1) / 2) + 1;
    if ((i % 2) == 0) {
      ranksForDoubleElimi[i] = Math.pow(2, j);
    } else {
      ranksForDoubleElimi[i] = (Math.pow(2, j) - Math.pow(2, j - 2));
    }
    ranksForDoubleElimi[i]++;
  }
  for (let i = 0; i < ranksForSingleElimi.length; i++) {
    ranksForSingleElimi[i] = Math.pow(2, i + 1) + 1;
  }
}

(async () => {
  init();
  const prisma = new PrismaClient();
  const TOURNAMENT_ID = 64;
  let records = await prisma.record.findMany({
    where: {
      tournament_id: TOURNAMENT_ID
    },
    orderBy: {
      "round": "desc"
    }
  });

  const maxRound = records.filter(r => r.round < 10000).reduce((prev, current) => prev > current.round ? prev : current.round, 0);
  const ranks = maxRound < 100 ? ranksForSingleElimi : ranksForDoubleElimi;

  if (ranks === ranksForDoubleElimi) {
    records = records.filter((r) => r.round >= 100);
  }
  const playerIdToRank = new Map<number, number>();
  records.forEach((record) => {
    if (record.no_result) {
      return;
    }
    const round = record.round;
    const loserId = record.loser_id;
    console.log(round, loserId)
    if (round >= 10000) {
      const winnerId = record.winner_id;
      playerIdToRank.set(winnerId, 1);
      playerIdToRank.set(loserId, 2);
      return;
    }
    playerIdToRank.set(loserId, ranks[maxRound - round]);
  })
  const insertQuery = Array.from(playerIdToRank).map(([playerId, finalRank]) => {
    return `(${playerId}, ${TOURNAMENT_ID}, ${finalRank})`;
  }).join(",");

  // console.log(`INSERT INTO final_rank (player_id, tournament_id, final_rank) values ${insertQuery};`);
})();