import { PrismaClient } from "@prisma/client";
import zlib from "zlib";

(async () => {
  const prisma = new PrismaClient();
  const players = await prisma.player.findMany({
    where: {
      is_valid: true
    }
  });
  const recordGroupByWinnerId = await prisma.record.groupBy({ by: "winner_id", _count: true });
  const playerIdToWinNum = {} as { [i: string]: number };
  recordGroupByWinnerId.forEach((r) => {
    playerIdToWinNum[String(r.winner_id)] = r._count;
  });

  // console.log("valid players: " + players.length)
  const normalizedMap = await prisma.normalized_map.findMany({
    where: {
      player_id: { in: players.map((p) => p.id) },
    }
  });
  normalizedMap.sort((a, b) => {
    return (playerIdToWinNum[String(b.player_id)] || 0) - (playerIdToWinNum[String(a.player_id)] || 0)
  });
  const normalizedMapPerPlayerId = {} as { [i: number]: typeof normalizedMap[0][] };
  normalizedMap.forEach((nm) => {
    if (!normalizedMapPerPlayerId[nm.player_id]) {
      normalizedMapPerPlayerId[nm.player_id] = [];
    }
    normalizedMapPerPlayerId[nm.player_id].push(nm);
  })

  //console.log(normalizedMapPerPlayerId);
  let output = "";
  const donePlayerIdSet = new Set<number>();
  normalizedMap.forEach((nm) => {
    const playerId = nm.player_id;
    if (donePlayerIdSet.has(playerId)) {
      return;
    }
    const nmArr = normalizedMapPerPlayerId[playerId];
    const player = players.find((p) => p.id == playerId);
    if (!player) {
      return;
    }
    const playerNameSet = new Set<string>();
    nmArr.forEach((nm) => playerNameSet.add(normalizePlayerName(nm.actual_name)));
    playerNameSet.delete(player.name.toLowerCase());

    // console.log(playerId + "\t" + player.name + "\t" + nmArr.reduce((prev, nm) => prev + nm.actual_name, ""));
    // output += playerId + "\t" + player.name + "\t" + nmArr.reduce((prev, nm) => prev + nm.actual_name, "");
    output += playerId + "\t" + player.name + "\t" + Array.from(playerNameSet).join("");
    output += "\n";
    donePlayerIdSet.add(playerId);
  })
  process.stdout.write(output.substring(0, output.length - 1));
  // console.log(gzipAndBase64(output));
})();

const normalizePlayerName = (name: string) => {
  const ret = name.replace("（", "(").replace("）", ")").replace("｜", "|").replace("　", "").replace("│", "|").toLowerCase();
  if (ret.indexOf('|') >= 0) {
    return ret.split('|')[1].trim();
  }
  return ret.trim();
}

function gzipAndBase64(str: string): string {
  const content = encodeURIComponent(str) // エンコード
  const result = zlib.gzipSync(content)   // 圧縮
  const value = result.toString('base64') // Buffer => base64変換
  return value;
}