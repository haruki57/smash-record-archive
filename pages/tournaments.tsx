import React, { useMemo, useState } from "react";
import { GetServerSideProps, GetStaticProps } from "next";

import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Layout from "@/components/layout";
import useSWR from "swr";
import { TournamentIndex } from "@/types/types";

const fetcher = (...args: any) => fetch(args).then((res) => res.text());

const Tournaments: React.FC = () => {
  const { data: tournamentMasterDataTsv, error } = useSWR(
    "/tournaments_master.txt",
    fetcher
  );
  const tournamentMasterData = useMemo(() => {
    if (!tournamentMasterDataTsv) {
      return undefined;
    }
    return JSON.parse(tournamentMasterDataTsv) as TournamentIndex[];
  }, [tournamentMasterDataTsv]);
  if (!tournamentMasterData) {
    return;
  }

  return (
    <Layout>
      {tournamentMasterData.map((tournament) => {
        return (
          <div key={tournament.id} className="flex">
            <div>{tournament.name}</div>
            <div>{tournament.date}</div>
            <div>{tournament.game}</div>
          </div>
        );
      })}
    </Layout>
  );
};

export default Tournaments;
