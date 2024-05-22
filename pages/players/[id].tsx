import React, { useEffect, useMemo, useState } from "react";

import { GetStaticProps } from "next";
import Link from "next/link";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

import { PlayerJson } from "@/types/types";
import clsx from "clsx";
import Layout from "@/components/layout";
import { unzip } from "@/utils/util";
import Head from "next/head";

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
const gameToLabel = (game: Game) => {
  if (game === "smashsp") {
    return "スマブラSP";
  }
  if (game === "smash4") {
    return "スマブラ4";
  }
  return "スマブラDX";
};

const isBye = (record: Record) => {
  return record.myScore < 0 || record.opponentScore < 0;
};

const Player: React.FC<{ playerJson: string }> = ({ playerJson }) => {
  const [showingGame, setShowingGame] = useState<Game>("smashsp");
  const allData = useMemo(() => {
    const ret = JSON.parse(unzip(playerJson)) as PlayerJson;
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
      <Head>
        <title>{playerData.name + `- Smash Record Archive`}</title>
        <meta name="description" content={playerData.name + " さんの戦績"} />
      </Head>
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
                  <Link href={"/tournaments/" + id}>{name}</Link>
                </div>
                <div className="basis-3/12">{date}</div>
                <div className="basis-1/12">
                  {finalRank ? finalRank + " 位" : "N/A"}
                </div>
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
  const getCommand = new GetItemCommand({
    TableName: "smashrecordarchive-players",
    Key: { id: { N: context.params!.id as string } },
  });
  const dynamo = new DynamoDBClient();
  const dynamoRes = await dynamo.send(getCommand);
  const playerJson = dynamoRes.Item?.playerJson.S!;
  return { props: { playerJson } };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default Player;
