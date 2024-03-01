// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PrismaClient } from "@prisma/client";
import { Record, TournamentsPerGame, PlayerJson } from "../types/types"
import zlib from "zlib";

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
  const prisma = new PrismaClient();
  const players = await prisma.player.findMany();
  const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const playerId = player.id;
    const recordRows = await prisma.record.findMany({
      where: { OR: [{ winner_id: playerId }, { loser_id: playerId }] },
      orderBy: [
        { tournament_id: "desc" },
        { phase_order: "desc" },
        { round: "desc" },
      ],
    });
    if (!recordRows) {
      continue;
    }
  
    const tournaments = await prisma.tournament.findMany({
      where: { id: { in: recordRows.map((r) => r.tournament_id || -1) } },
      orderBy: [{ date: "desc" }],
    });
  
    const finalRanks: any[] =
      (await prisma.$queryRaw`select * from final_rank where player_id = ${playerId}`) ||
      [];
    const tournamentIdToFinalRank: { [s: number]: number } = {};
    finalRanks.forEach((finalRank) => {
      tournamentIdToFinalRank[finalRank.tournament_id] = finalRank.final_rank;
    });
    const tournamentsPerGame: TournamentsPerGame = { melee: [], smash4: [], smashsp: [] };
    tournaments.forEach((tournament) => {
      tournamentsPerGame[tournament.game].push({
        id: tournament.id,
        name: tournament.display_name,
        date: tournament.date.toLocaleDateString("ja-JP"),
        finalRank: tournamentIdToFinalRank[tournament.id] || null,
        records: [],
      });
    });
  
    recordRows.forEach((record) => {
      const round = record.round;
      const phaseName = record.phase_name;
      let roundStr = phaseName ? phaseName + " " : "";
      if (round < 100) {
        roundStr += " (W) #" + round;
      } else if (round < 10000) {
        roundStr += " (L) #" + (round - 100);
      } else if (round === 10000) {
        roundStr += "GF";
      } else {
        roundStr += "GF2";
      }
      let opponentName;
      let opponentId;
      let myScore;
      let opponentScore;
      if (record.winner_id === playerId) {
        opponentName = record.loser;
        opponentId = record.loser_id || 0;
        myScore = record.winner_score || 0;
        opponentScore = record.loser_score || 0;
      } else {
        opponentName = record.winner;
        opponentId = record.winner_id || 0;
        myScore = record.loser_score || 0;
        opponentScore = record.winner_score || 0;
      }
      const data: Record = {
        tournamentId: record.tournament_id || 0,
        opponentName,
        opponentId,
        myScore,
        opponentScore,
        roundStr,
      };
      const tournament = tournamentsPerGame[record.game].find(
        (tournament) => tournament.id === record.tournament_id
      );
      if (!tournament) {
        return;
      }
      tournament.records.push(data);
    });
    const playerJson: PlayerJson = {
      playerData: {
        name: player.name,
        nameEng: player.name_eng,
      },
      tournamentsPerGame,
    };

    const putCommand = new PutItemCommand({
      TableName: "smashrecordarchive-players",
      Item: {
        id: { N: playerId.toString() },
        playerJson: {
          S: gzipAndBase64(JSON.stringify(playerJson)),
        },
      },
    })
    await dynamo.send(putCommand);
    if (i % 10 === 0 ) {
      console.log("inserted " + (i + 1) + " rows.")
    }
    await sleep(2000);
  }

})();

function gzipAndBase64(str: string): string {
  const content = encodeURIComponent(str) // エンコード
  const result = zlib.gzipSync(content)   // 圧縮
  const value = result.toString('base64') // Buffer => base64変換
  return value;
}