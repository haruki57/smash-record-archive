import React, { useEffect, useMemo, useState } from "react";

import { GetServerSideProps, GetStaticProps } from "next";
//import Layout from "../../components/Layout";
import Head from "next/head";

import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import zlib from "zlib";
import { PlayerJson } from "@/types/types";
import clsx from "clsx";
import Layout from "@/components/layout";

type Game = "smashsp" | "smash4" | "melee";
const GAMES: Game[] = ["smashsp", "smash4", "melee"] as const;

type Record = {
  tournamentId: number;
  opponentId: number;
  opponentName: string;
  myScore: number;
  opponentScore: number;
  roundStr: string;
};

type Tournament = {
  id: number;
  name: string;
  date: string;
  finalRank: number | null;
  records: Record[];
};

type TournamentsPerGame = {
  smashsp: Tournament[];
  smash4: Tournament[];
  melee: Tournament[];
};
const ordinal = (n: number | undefined) => {
  if (!n) {
    return undefined;
  }
  const s1 = +("" + n).slice(-1);
  const s2 = +("" + n).slice(-2);
  if (s2 >= 11 && s2 <= 13) {
    return n + "th";
  } else if (s1 === 1) {
    return n + "st";
  } else if (s1 === 2) {
    return n + "nd";
  } else if (s1 === 3) {
    return n + "rd";
  } else {
    return n + "th";
  }
};
const gameToLabel = (game: Game) => {
  if (game === "smashsp") {
    return "スマブラSP";
  }
  if (game === "smash4") {
    return "スマブラ4";
  }
  return "スマブラDX";
};
const unzip = (value: string): string => {
  const buffer = Buffer.from(value, "base64"); // base64 => Bufferに変換
  const result = zlib.unzipSync(buffer); // 復号化
  const str = decodeURIComponent(result.toString()); // デコード
  return str;
};

const isBye = (record: Record) => {
  return record.myScore < 0 || record.opponentScore < 0;
};

const Player: React.FC<{ playerJson: string }> = ({ playerJson }) => {
  const [showingGame, setShowingGame] = useState<Game>("smashsp");
  const allData = useMemo(() => {
    const ret = JSON.parse(unzip(playerJson)) as PlayerJson;
    GAMES.forEach((game) => {
      ret.tournamentsPerGame[game] = ret.tournamentsPerGame[game].filter(
        (t) => t.records.length > 0
      );
    });
    return ret;
  }, [playerJson]);
  const { playerData, tournamentsPerGame } = allData;
  const numTournaments = useMemo(() => {
    return tournamentsPerGame[showingGame].length;
  }, [tournamentsPerGame, showingGame]);
  const numWins = useMemo(() => {
    return tournamentsPerGame[showingGame].reduce((prev, current) => {
      return (
        prev +
        current.records.filter((r) => r.myScore > r.opponentScore && !isBye(r))
          .length
      );
    }, 0);
  }, [tournamentsPerGame, showingGame]);
  const numLosses = useMemo(() => {
    return tournamentsPerGame[showingGame].reduce((prev, current) => {
      return (
        prev +
        current.records.filter((r) => r.myScore < r.opponentScore && !isBye(r))
          .length
      );
    }, 0);
  }, [tournamentsPerGame, showingGame]);

  const [openingTournamentIdSetPerGame, setOpeningTournamentIdSetPerGame] =
    useState<{
      smashsp: Set<number>;
      smash4: Set<number>;
      melee: Set<number>;
    }>({
      smashsp: new Set(),
      smash4: new Set(),
      melee: new Set(),
    });

  useEffect(() => {
    console.log("useeffect");
    if (tournamentsPerGame.smashsp.length > 0) {
      setShowingGame("smashsp");
    } else if (tournamentsPerGame.smash4.length > 0) {
      setShowingGame("smash4");
    } else {
      setShowingGame("melee");
    }
    setOpeningTournamentIdSetPerGame({
      smashsp: new Set(),
      smash4: new Set(),
      melee: new Set(),
    });
  }, [tournamentsPerGame]);

  const handleAccordingClick = (tournamentId: number) => {
    if (openingTournamentIdSetPerGame[showingGame].has(tournamentId)) {
      openingTournamentIdSetPerGame[showingGame].delete(tournamentId);
    } else {
      openingTournamentIdSetPerGame[showingGame].add(tournamentId);
    }
    setOpeningTournamentIdSetPerGame({
      ...openingTournamentIdSetPerGame,
      [showingGame]: new Set(openingTournamentIdSetPerGame[showingGame]),
    });
  };
  const flipAllAccordionState = () => {
    if (
      openingTournamentIdSetPerGame[showingGame].size ===
      tournamentsPerGame[showingGame].length
    ) {
      openingTournamentIdSetPerGame[showingGame].clear();
    } else {
      tournamentsPerGame[showingGame].forEach((t) => {
        openingTournamentIdSetPerGame[showingGame].add(t.id);
      });
    }
    setOpeningTournamentIdSetPerGame({
      ...openingTournamentIdSetPerGame,
      [showingGame]: new Set(openingTournamentIdSetPerGame[showingGame]),
    });
  };

  return (
    <Layout>
      <div className="mx-10 my-10">
        <div className="text-xl">{playerData.name + " さんの成績"}</div>
        {GAMES.map((game) => {
          if (tournamentsPerGame[game].length === 0) {
            return;
          }
          return (
            <button
              key={game}
              onClick={() => {
                setShowingGame(game);
              }}
              className={clsx(
                "text-sm px-4 py-2 mr-2 mt-2 border rounded",
                showingGame === game && "cursor-default bg-blue-400 text-white",
                showingGame !== game && " hover:bg-gray-200 text-blue-400"
              )}
            >
              {gameToLabel(game)}
            </button>
          );
        })}
        <div className="mx-2 mt-2 text-sm">
          <div>出場大会数: {numTournaments}</div>
          <div>
            {numWins} 勝 {numLosses} 敗
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="text-blue-400 text-sm border rounded px-2 py-2 mr-2 my-2"
            onClick={flipAllAccordionState}
          >
            全ての試合結果を表示
          </button>
        </div>
        {tournamentsPerGame[showingGame].map((tournament, index, arr) => {
          const { id, name, finalRank, date, records } = tournament;
          return (
            <div key={id} className={clsx("text-sm")}>
              <div
                className={clsx(
                  "flex flex-row py-1 border-t border-gray-300 hover:bg-gray-100",
                  index === arr.length - 1 && "border-b"
                )}
              >
                <div className="basis-6/12 text-blue-400 mx-2">
                  <Link href={"/tournaments/1207"}>{name}</Link>
                </div>
                <div className="basis-3/12">{date}</div>
                <div className="basis-1/12">{finalRank + " 位"}</div>
                <div
                  className="basis-2/12 cursor-pointer text-blue-400"
                  onClick={() => {
                    handleAccordingClick(id);
                  }}
                >
                  試合結果を表示
                </div>
              </div>

              <div
                className={clsx(
                  !openingTournamentIdSetPerGame[showingGame].has(id) &&
                    "hidden"
                )}
              >
                {records.map((record, index, arr) => {
                  const backgroundColorClass =
                    record.myScore > record.opponentScore
                      ? "bg-green-100 hover:bg-green-200"
                      : record.myScore < record.opponentScore
                      ? "bg-red-100 hover:bg-red-200"
                      : "bg-gray-100  hover:bg-gray-200";
                  let scoreText;
                  if (record.myScore === -1) {
                    scoreText = "不戦敗";
                  } else if (record.opponentScore === -1) {
                    scoreText = "不戦勝";
                  } else if (
                    record.myScore === 1 &&
                    record.opponentScore === 0
                  ) {
                    scoreText = "勝";
                  } else if (
                    record.myScore === 0 &&
                    record.opponentScore === 1
                  ) {
                    scoreText = "負";
                  } else {
                    scoreText = record.myScore + "-" + record.opponentScore;
                  }
                  return (
                    <div
                      className={clsx(
                        "flex flex-row px-2 py-1",
                        index === arr.length - 1 &&
                          "mb-4 border-b border-gray-300",
                        backgroundColorClass
                      )}
                      key={record.tournamentId + record.roundStr}
                    >
                      <div className={clsx("basis-1/12")}>{scoreText}</div>
                      <div className={clsx("basis-5/12")}>
                        <Link
                          href={"/players/" + record.opponentId}
                          className="text-blue-400"
                        >
                          {record.opponentName}
                        </Link>
                      </div>
                      <div className={clsx("basis-6/12")}>
                        {record.roundStr}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  //console.log(context.params);

  const getCommand = new GetItemCommand({
    TableName: "smashrecordarchive-players",
    Key: { id: { N: context.params!.id as string } },
  });
  const dynamo = new DynamoDBClient();
  const dynamoRes = await dynamo.send(getCommand);
  // const playerJson = JSON.parse(unzip(dynamoRes.Item?.playerJson.S!));
  const playerJson = dynamoRes.Item?.playerJson.S!;
  // const res = await fetch(
  //   `http://localhost:3000/api/players?id=${context.params.id}`
  // );
  // const data = await res.text();
  // console.log(data);
  // const playerJson = JSON.parse(data);
  // console.log(playerJson);
  return { props: { playerJson } };
  // const { params } = context;

  // if (!params || !params.id) {
  //   return { notFound: true };
  // }
  // if (typeof params.id !== "string") {
  //   return { notFound: true };
  // }
  // const prisma = new PrismaClient();
  // const playerId = parseInt(params?.id);
  // const player = await prisma.player.findUnique({ where: { id: playerId } });
  // if (!player) {
  //   return { notFound: true };
  // }
  // const recordRows = await prisma.record.findMany({
  //   where: { OR: [{ winner_id: playerId }, { loser_id: playerId }] },
  //   orderBy: [
  //     { tournament_id: "desc" },
  //     { phase_order: "desc" },
  //     { round: "desc" },
  //   ],
  // });
  // if (!recordRows) {
  //   return { notFound: true };
  // }

  // const tournaments = await prisma.tournament.findMany({
  //   where: { id: { in: recordRows.map((r) => r.tournament_id || -1) } },
  //   orderBy: [{ date: "desc" }],
  // });

  // const finalRanks: any[] =
  //   (await prisma.$queryRaw`select * from final_rank where player_id = ${playerId}`) ||
  //   [];
  // const tournamentIdToFinalRank: { [s: number]: number } = {};
  // finalRanks.forEach((finalRank) => {
  //   tournamentIdToFinalRank[finalRank.tournament_id] = finalRank.final_rank;
  // });
  // const ret: TournamentsPerGame = { melee: [], smash4: [], smashsp: [] };
  // tournaments.forEach((tournament) => {
  //   ret[tournament.game].push({
  //     id: tournament.id,
  //     name: tournament.display_name,
  //     date: tournament.date.toLocaleDateString("ja-JP"),
  //     finalRank: tournamentIdToFinalRank[tournament.id] || null,
  //     records: [],
  //   });
  // });

  // recordRows.forEach((record) => {
  //   const round = record.round;
  //   const phaseName = record.phase_name;
  //   let roundStr = phaseName ? phaseName + " " : "";
  //   if (round < 100) {
  //     roundStr += " (W) #" + round;
  //   } else if (round < 10000) {
  //     roundStr += " (L) #" + (round - 100);
  //   } else if (round === 10000) {
  //     roundStr += "GF";
  //   } else {
  //     roundStr += "GF2";
  //   }
  //   let opponentName;
  //   let opponentId;
  //   let myScore;
  //   let opponentScore;
  //   if (record.winner_id === playerId) {
  //     opponentName = record.loser;
  //     opponentId = record.loser_id || 0;
  //     myScore = record.winner_score || 0;
  //     opponentScore = record.loser_score || 0;
  //   } else {
  //     opponentName = record.winner;
  //     opponentId = record.winner_id || 0;
  //     myScore = record.loser_score || 0;
  //     opponentScore = record.winner_score || 0;
  //   }
  //   const data: Record = {
  //     tournamentId: record.tournament_id || 0,
  //     opponentName,
  //     opponentId,
  //     myScore,
  //     opponentScore,
  //     roundStr,
  //   };
  //   const tournament = ret[record.game].find(
  //     (tournament) => tournament.id === record.tournament_id
  //   );
  //   if (!tournament) {
  //     return;
  //   }
  //   tournament.records.push(data);
  // });

  // return {
  //   props: {
  //     playerData: {
  //       name: player.name,
  //       nameEng: player.name_eng,
  //     },
  //     tournamentsPerGame: ret,
  //   },
  // };
};

export async function getStaticPaths() {
  // const prisma = new PrismaClient();
  // const players = await prisma.player.findMany();
  // return {
  //   paths: players.map((p) => {
  //     return {
  //       params: {
  //         id: p.id.toString(),
  //       },
  //     };
  //   }),
  //   fallback: false,
  // };

  return {
    paths: [],
    fallback: "blocking",
  };
}

export default Player;
