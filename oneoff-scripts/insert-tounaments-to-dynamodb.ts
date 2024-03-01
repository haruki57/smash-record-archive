// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PrismaClient } from "@prisma/client";
import zlib from "zlib";

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
  const prisma = new PrismaClient();
  const tournaments = await prisma.tournament.findMany();
  const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });

  for (let i = 0; i < tournaments.length; i++) {
    const tournament = tournaments[i];
    const tournamentId = tournament.id;
    const finalRanks: { tournament_id: number; final_rank: number; player_id: number}[] =
      (await prisma.$queryRaw`select * from final_rank where tournament_id = ${tournamentId} order by final_rank`) ||
      [];

    const playerIdToRankMap = new Map<number, number>();
    finalRanks.forEach((rank) => {
      playerIdToRankMap.set(rank.player_id, rank.final_rank);
    });
    const recordRows = await prisma.record.findMany({
      where: { tournament_id: tournamentId,  },
      orderBy: [
        { phase_order: "asc" },
        { round: "asc" },
      ],
    });
    
    const isChallonge = tournament.event_id == null;

    const tournamentJson = {
      tournamentData: {
        name: tournament.display_name,
        url: isChallonge ? `http://challonge.com/${tournament.name}` : `https://www.start.gg/tournament/${tournament.name}/events`,
        date: tournament.date.toLocaleDateString("ja-JP"),
        game: tournament.game,
      },
      ranks: finalRanks.map((finalRank) => {
        const playerId = finalRank.player_id;
        const rank = finalRank.final_rank;
        const winRow = recordRows.filter((record) => {
          return record.winner_id === playerId
        });
        const loseRow = recordRows.filter((record) => {
          return record.loser_id === playerId
        });
        const lostTo = loseRow.map((r) => r.winner_id);
        const playerName = winRow.length > 0 ? winRow[0].winner : loseRow[0].loser;
        return {
          rank,
          playerName,
          playerId,
          lostTo,
        }
      })
    }
  
    const putCommand = new PutItemCommand({
      TableName: "smashrecordarchive-tournaments",
      Item: {
        id: { N: tournamentId.toString() },
        tournamentJson: {
          S: gzipAndBase64(JSON.stringify(tournamentJson)),
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