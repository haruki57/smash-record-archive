import React, { useMemo, useState } from "react";
import { GetStaticProps } from "next";

import Link from "next/link";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unzip } from "@/utils/util";
import { TournamentJson } from "@/types/types";
import Layout from "@/components/layout";
import clsx from "clsx";

type Props = {
  tournamentJson: string;
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

const Tournament: React.FC<Props> = ({ tournamentJson }) => {
  const allData = useMemo(() => {
    const ret = JSON.parse(unzip(tournamentJson)) as TournamentJson;
    return ret;
  }, [tournamentJson]);
  const { tournamentData, ranks } = allData;
  const playerIdToPlayer = useMemo(() => {
    return ranks.reduce((map, rank) => {
      map.set(rank.playerId, { playerName: rank.playerName, rank: rank.rank });
      return map;
    }, new Map<number, { playerName: string; rank: number }>());
  }, [ranks]);

  return (
    <Layout>
      <div className="mx-10 my-10">
        <div className="text-xl">{tournamentData.name}</div>
        <div className="mx-2 my-2">
          <div>
            <a
              href={tournamentData.url}
              className="text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              トーナメント表
            </a>
          </div>
          <div>{tournamentData.date}</div>
          <div>{"game: " + gameToLabel(tournamentData.game)}</div>
        </div>
        <div className="mt-8">
          <div className="flex text-sm border-b max-w-2xl mb-2">
            <div className="basis-1/12 mx-2">順位</div>
            <div className="basis-3/12">プレイヤー名</div>
            <div className="basis-4/12">負けた相手(勝者側)</div>
            <div className="basis-4/12">負けた相手(敗者側)</div>
          </div>
          {ranks.map((rank) => {
            return (
              <div
                key={rank.playerId}
                className="flex border-b max-w-2xl hover:bg-gray-200"
              >
                <div className="basis-1/12  mx-2">{rank.rank + " 位"}</div>
                <div className="basis-3/12 text-blue-400">
                  <Link href={"/players/" + rank.playerId}>
                    {rank.playerName}
                  </Link>
                </div>
                {rank.lostTo.map((playerId, index) => {
                  return (
                    <div key={playerId} className="basis-4/12">
                      <Link
                        href={"/players" + playerIdToPlayer.get(playerId)?.rank}
                        className="text-blue-400"
                      >
                        {playerIdToPlayer.get(playerId)?.playerName}
                      </Link>
                      <span>
                        {" "}
                        ({playerIdToPlayer.get(playerId)?.rank + " 位"})
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const getCommand = new GetItemCommand({
    TableName: "smashrecordarchive-tournaments",
    Key: { id: { N: context.params!.id as string } },
  });
  const dynamo = new DynamoDBClient();
  const dynamoRes = await dynamo.send(getCommand);
  const tournamentJson = dynamoRes.Item?.tournamentJson.S!;
  return { props: { tournamentJson } };

  // const { params } = context;

  // if (!params || !params.id) {
  //   return { notFound: true };
  // }
  // if (typeof params.id !== "string") {
  //   return { notFound: true };
  // }
  // const prisma = new PrismaClient();
  // const tournamentId = parseInt(params?.id);
  // const tournament = await prisma.tournament.findUnique({
  //   where: { id: tournamentId },
  // });
  // if (!tournament) {
  //   return { notFound: true };
  // }
  // return {
  //   props: {
  //     tournament: {
  //       ...tournament,
  //       date: tournament.date.toLocaleDateString("ja-JP"),
  //     },
  //   },
  // };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default Tournament;
