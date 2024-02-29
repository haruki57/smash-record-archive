import React, { useState } from "react";
import { GetServerSideProps, GetStaticProps } from "next";
//import Layout from "../../components/Layout";
import Head from "next/head";

import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import zlib from "zlib";

type Game = "smashsp" | "smash4" | "melee";
const gameToTabId = {
  smashsp: 0,
  smash4: 1,
  melee: 2,
};
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
type Props = {
  playerData: {
    name: string;
    nameEng: string;
  };
  tournamentsPerGame: TournamentsPerGame;
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
const unzip = (value: string): string => {
  const buffer = Buffer.from(value, "base64"); // base64 => Bufferに変換
  const result = zlib.unzipSync(buffer); // 復号化
  const str = decodeURIComponent(result.toString()); // デコード
  return str;
};
//const Player: React.FC<Props> = ({ playerData, tournamentsPerGame }) => {
const Player: React.FC = ({ playerJson }: any) => {
  // const [game, setGame] = useState<Game>("smashsp");

  // const [isAccordionExpand, setIsAccordionExpand] = useState<{
  //   [id: number]: boolean;
  // }>(
  //   tournamentsPerGame[game].reduce(
  //     (prev: { [s: number]: boolean }, tournament: Tournament) => {
  //       prev[tournament.id] = false;
  //       return prev;
  //     },
  //     {}
  //   )
  // );
  // const handleAccordingClick = (i: number) => {
  //   const newState = { ...isAccordionExpand };
  //   newState[i] = !isAccordionExpand[i];
  //   setIsAccordionExpand(newState);
  // };
  // const flipAllAccordionState = () => {
  //   const newState = tournamentsPerGame[game].reduce(
  //     (prev: { [s: number]: boolean }, tournament: Tournament) => {
  //       prev[tournament.id] = !isAccordionExpand[tournament.id];
  //       return prev;
  //     },
  //     {}
  //   );
  //   setIsAccordionExpand(newState);
  // };
  // const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  //   if (newValue === 0) {
  //     setGame("smashsp");
  //   } else if (newValue === 1) {
  //     setGame("smash4");
  //   } else {
  //     setGame("melee");
  //   }
  // };
  // return <div>{JSON.stringify(tournamentsPerGame)}</div>;
  return <div>{unzip(playerJson)}</div>;
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
