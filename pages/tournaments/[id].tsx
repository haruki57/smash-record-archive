import React, { useState } from "react";
import { GetServerSideProps, GetStaticProps } from "next";
import Head from "next/head";

import { PrismaClient } from "@prisma/client";
import Link from "next/link";

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
  tournament: Tournament;
};
const Player: React.FC<Props> = ({ tournament }) => {
  // const [game, setGame] = useState<Game>("smashsp");
  return <div>{JSON.stringify(tournament)}</div>;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;

  if (!params || !params.id) {
    return { notFound: true };
  }
  if (typeof params.id !== "string") {
    return { notFound: true };
  }
  const prisma = new PrismaClient();
  const tournamentId = parseInt(params?.id);
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament) {
    return { notFound: true };
  }
  return {
    props: {
      tournament: {
        ...tournament,
        date: tournament.date.toLocaleDateString("ja-JP"),
      },
    },
  };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
  // const prisma = new PrismaClient();
  // const tournaments = await prisma.tournament.findMany();
  // return {
  //   paths: tournaments.map((t) => {
  //     return {
  //       params: { id: t.id.toString() },
  //     };
  //   }),
  //   fallback: false,
  // };
}

export default Player;
