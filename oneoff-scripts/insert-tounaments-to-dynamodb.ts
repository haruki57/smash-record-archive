// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PrismaClient } from "@prisma/client";
import zlib from "zlib";
import { TournamentJson } from '../types/types';

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
  const prisma = new PrismaClient();
  const tournaments = await prisma.tournament.findMany({where: {is_dealt: true, date: {gte: new Date("1990-01-01")}}});
  const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });

  for (let i = 0; i < tournaments.length; i++) {
    const tournament = tournaments[i];
    const tournamentId = tournament.id;
    if ((422 <= tournamentId && tournamentId <= 439) 
        || (593 <= tournamentId && tournamentId <= 607)
      || (760 <= tournamentId && tournamentId <= 768)
      || (786 <= tournamentId && tournamentId <= 787)
      || (tournamentId === 848)
      || tournamentId === 1147
      || tournamentId === 1226
      || tournamentId === 1227
      || tournamentId === 1238
    ){
      // Foreign tournament records for JPR.
      continue;
    }
    console.log(i, tournamentId, tournament.display_name);
    const finalRanks: { tournament_id: number; final_rank: number; player_id: number}[] =
      (await prisma.$queryRaw`select * from final_rank where tournament_id = ${tournamentId} order by final_rank`) ||
      [];

    const playerIdToRankMap = new Map<number, number>();
    finalRanks.forEach((rank) => {
      playerIdToRankMap.set(rank.player_id, rank.final_rank);
    });
    const players = await prisma.player.findMany({
      where: {
        id: {
          in: finalRanks.map((fr) => fr.player_id)
        }
      }
    });
    
    const recordRows = await prisma.record.findMany({
      where: { tournament_id: tournamentId,  },
      orderBy: [
        { phase_order: "asc" },
        { round: "asc" },
      ],
    });
    
    const isChallonge = tournament.event_id == null;

    const tournamentJson: TournamentJson = {
      tournamentData: {
        name: tournament.display_name,
        url: tournamentId === 227 ? undefined // TSC 3
          : isChallonge ? `http://challonge.com/${tournament.name}` : `https://www.start.gg/tournament/${tournament.name}/events`,
        date: createDateStr(tournament.date),
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
        const lostTo = loseRow.map((r) => r.winner_id!);
        let playerName;
        if (tournamentId === 227 // TSC 3
          || tournamentId === 589  // umebura t.a.t
          || tournamentId === 609// EVO Japan 2018
          || tournamentId === 627// 闘会議2018 本戦
          || tournamentId === 1125// Weekly Smash Party 〜スマパ〜#44
        ) { 
          playerName = players.find((p) => p.id === playerId)!.name;
        } else {
          playerName = winRow.length > 0 ? winRow[0].winner : loseRow[0].loser;
        }

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
    await sleep(500);
  }
})();

function createDateStr(date: Date): string {
  const jaJP = date.toLocaleDateString("ja-JP");
  const [year, month, day] = jaJP.split("/");
  return year + "-" + ('0' + month).slice(-2) + "-" + ('0' + day).slice(-2);
}

function gzipAndBase64(str: string): string {
  const content = encodeURIComponent(str) // エンコード
  const result = zlib.gzipSync(content)   // 圧縮
  const value = result.toString('base64') // Buffer => base64変換
  return value;
}