import { PrismaClient } from "@prisma/client";
import zlib from "zlib";
import { TournamentIndex } from "../types/types";

(async () => {
  const prisma = new PrismaClient();

  const tournaments = (await prisma.tournament.findMany({ where: { is_dealt: true, date: { gte: new Date("1990-01-01") } } }))
    .filter((t) => {
      const tournamentId = t.id;
      if ((422 <= tournamentId && tournamentId <= 439)
        || (593 <= tournamentId && tournamentId <= 607)
        || (760 <= tournamentId && tournamentId <= 768)
        || (786 <= tournamentId && tournamentId <= 787)
        || (tournamentId === 848)
        || tournamentId === 1147
        || tournamentId === 1226
        || tournamentId === 1227
        || tournamentId === 1238
      ) {
        // Foreign tournament records for JPR.
        return false;
      }
      return true;
    });

  process.stdout.write(JSON.stringify(tournaments.map((t) => {
    return {
      id: t.id,
      name: t.display_name,
      date: createDateStr(t.date),
      game: t.game,
    } as TournamentIndex;
  })));
})();

function createDateStr(date: Date): string {
  const jaJP = date.toLocaleDateString("ja-JP");
  const [year, month, day] = jaJP.split("/");
  return year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);
}