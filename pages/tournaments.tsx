import React, { useState } from "react";
import { GetServerSideProps, GetStaticProps } from "next";
//import Layout from "../../components/Layout";
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
  tournaments: Tournament[];
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
const Tournaments: React.FC<Props> = ({ tournaments }) => {
  return <div>{JSON.stringify(tournaments)}</div>;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const prisma = new PrismaClient();
  const tournaments = await prisma.tournament.findMany();
  return {
    props: {
      tournaments: tournaments.map((tournament) => {
        return {
          ...tournament,
          date: tournament.date.toLocaleDateString("ja-JP"),
        };
      }),
    },
  };
};

export default Tournaments;
