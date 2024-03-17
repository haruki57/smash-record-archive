import React, { useMemo, useState } from "react";
import { GetServerSideProps, GetStaticProps } from "next";

import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Layout from "@/components/layout";
import useSWR from "swr";
import { Game, TournamentIndex } from "@/types/types";
import clsx from "clsx";

const fetcher = (...args: any) => fetch(args).then((res) => res.text());
const gameToLabel = (game: Game) => {
  if (game === "smashsp") {
    return "スマブラSP";
  }
  if (game === "smash4") {
    return "スマブラ4";
  }
  return "スマブラDX";
};

function kanaToHira(str: string) {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

const Tournaments: React.FC = () => {
  const { data: tournamentMasterDataTsv, error } = useSWR(
    "/tournaments_master.txt",
    fetcher
  );
  const [showingGame, setShowingGame] = useState<Game>("smashsp");
  const [query, setQuery] = useState<string>("");
  const tournamentMasterData = useMemo(() => {
    if (!tournamentMasterDataTsv) {
      return undefined;
    }
    return (JSON.parse(tournamentMasterDataTsv) as TournamentIndex[]).sort(
      (t1, t2) => (t2.date > t1.date ? 1 : t2.date < t1.date ? -1 : 0)
    );
  }, [tournamentMasterDataTsv]);
  if (!tournamentMasterData) {
    return;
  }

  return (
    <Layout>
      <div className="mx-10 my-10">
        <div className="text-xl">トーナメント一覧</div>
        {["smashsp", "smash4", "melee"].map((game) => {
          return (
            <button
              key={game}
              onClick={() => {
                setShowingGame(game as Game);
              }}
              className={clsx(
                "text-sm px-4 py-2 mr-2 mt-2 border rounded",
                showingGame === game && "cursor-default bg-blue-400 text-white",
                showingGame !== game && " hover:bg-gray-200 text-blue-400"
              )}
            >
              {gameToLabel(game as Game)}
            </button>
          );
        })}
        <div className="my-4 ml-2">
          <input
            type="text"
            value={query}
            placeholder="Filter by name"
            onChange={(e) => setQuery(e.target.value)}
            className="w-60 border-2 p-2 rounded"
          />
        </div>
        {tournamentMasterData
          .filter(
            (t) =>
              t.game === showingGame &&
              (query === ""
                ? true
                : kanaToHira(t.name)
                    .toLowerCase()
                    .indexOf(kanaToHira(query).toLowerCase()) >= 0)
          )
          .map((t, index, arr) => {
            return (
              <div
                key={t.id}
                className={clsx(
                  "flex flex-row py-1 border-t border-gray-300 hover:bg-gray-100 text-sm",
                  index === arr.length - 1 && "border-b"
                )}
              >
                <div className="basis-9/12 text-blue-400 mx-2">
                  <Link href={"/tournaments/" + t.id}>{t.name}</Link>
                </div>
                <div className="basis-3/12">{t.date}</div>
              </div>
            );
          })}
      </div>
    </Layout>
  );
};

export default Tournaments;
