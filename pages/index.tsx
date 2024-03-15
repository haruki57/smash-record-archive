import Image from "next/image";
import { Inter } from "next/font/google";
import useSWR from "swr";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Footer from "@/components/footer";
import Link from "next/link";
import Layout from "@/components/layout";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

const fetcher = (...args: any) => fetch(args).then((res) => res.text());

const FEATURED_PLAYERS = [
  { playerId: 7956, playerName: "ザクレイ" },
  { playerId: 4511, playerName: "かめめ" },
  { playerId: 4858, playerName: "KEN" },
  { playerId: 5435, playerName: "しゅーとん" },
  { playerId: 4914, playerName: "てぃー" },
  { playerId: 5468, playerName: "クロ" },
  { playerId: 5353, playerName: "Abadango" },
  { playerId: 4597, playerName: "ライト" },
  { playerId: 6974, playerName: "コメ" },
  { playerId: 5244, playerName: "プロトバナム" },
  { playerId: 5265, playerName: "T" },
  { playerId: 5355, playerName: "HIKARU" },
  { playerId: 4601, playerName: "ちょこ" },
  { playerId: 4400, playerName: "にえとの" },
  { playerId: 4414, playerName: "れあ" },
  { playerId: 4852, playerName: "kept" },
  { playerId: 4793, playerName: "うめき" },
  { playerId: 4805, playerName: "shky" },
  { playerId: 4989, playerName: "えつじ" },
  { playerId: 4610, playerName: "ブルード" },
  { playerId: 4457, playerName: "そめ" },
  { playerId: 5243, playerName: "Shogun" },
  { playerId: 4885, playerName: "シグマ" },
  { playerId: 5257, playerName: "がくと" },
  { playerId: 4624, playerName: "DIO" },
  { playerId: 6012, playerName: "ロン" },
  { playerId: 8790, playerName: "ニシヤ" },
  { playerId: 4883, playerName: "あとりえ" },
  { playerId: 5161, playerName: "キリハラ" },
  { playerId: 5271, playerName: "Eim" },
];

const FEATURED_TOURNAMENTS = [
  { id: 1271, name: "EVO Japan 2020 (スマブラSP)" },
  { id: 851, name: "Umebura for Wii U final (スマブラ4)" },
  { id: 401, name: "KSB2017 (スマブラDX)" },
];

function getRandomElements<T>(arr: T[], n: number): T[] {
  const result: T[] = [];
  const copy: T[] = [...arr];
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * copy.length);
    result.push(copy[randomIndex]);
    copy.splice(randomIndex, 1);
  }
  return result;
}

function kanaToHira(str: string) {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

export default function Home() {
  // Tsv
  // playerId \t playerName \t aliases
  // aliases can be empty
  // Players are ordered by number of wins.
  const { data: playerDataTsv, error } = useSWR("/master.txt", fetcher);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [featuredPlayers, setFeaturedPlayers] = useState<
    {
      playerId: number;
      playerName: string;
    }[]
  >([]);
  const playerData = useMemo(() => {
    if (!playerDataTsv) {
      return [];
    }
    const ret = [] as {
      playerId: number;
      playerName: string;
      aliases: string;
    }[];
    const rows = playerDataTsv.split("\n");
    rows.forEach((row) => {
      const splitted = row.split("\t");
      const [playerId, playerName, aliases] = splitted;
      ret.push({
        playerId: Number(playerId),
        playerName,
        aliases,
      });
    });
    return ret;
  }, [playerDataTsv]);

  const matchedPlayers = useMemo(() => {
    return playerData
      .filter((p) => {
        const playerStr = kanaToHira((p.playerName + p.aliases).toLowerCase());
        return playerStr.indexOf(query.toLowerCase()) >= 0;
      })
      .slice(0, 100)
      .map((p) => {
        return { playerId: p.playerId, playerName: p.playerName };
      });
  }, [query, playerData]);

  useEffect(() => {
    setFeaturedPlayers(getRandomElements(FEATURED_PLAYERS, 3));
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (matchedPlayers.length === 0 || query === "") {
      return;
    }
    router.push(`/players/${matchedPlayers[0].playerId}`);
  };

  if (!playerData || featuredPlayers.length === 0) {
    return;
  }
  return (
    <>
      <main className="mx-auto flex min-h-screen flex-col items-center">
        <div
          className="w-full pt-48 pb-24 bg-gray-100 flex justify-center"
          style={{
            backgroundImage: "url(/background.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div>
            <div className="text-5xl mb-10 text-white text-center">
              Smash Record Archive
            </div>
            <div className="mx-full flex justify-center ">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={query}
                  placeholder="Player Name"
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-60 border-2 p-2"
                />
              </form>
            </div>
            <div className="flex justify-center">
              <div className="overflow-auto overflow-y-scroll h-40 w-60">
                {query.length > 0 && matchedPlayers.length > 0 && (
                  <div className="border shadow-inner w-60 bg-white">
                    {matchedPlayers.map((p) => {
                      return (
                        <div key={p.playerId} className="">
                          <Link href={`/players/${p.playerId}`}>
                            <div className="p-2 hover:bg-gray-200">
                              {p.playerName}
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full pb-12">
          <div className="text-3xl text-center py-8">Featured Players</div>
          {featuredPlayers.map((p) => {
            return (
              <Link
                key={p.playerId}
                href={`/players/${p.playerId}`}
                className="block rounded py-4 w-80 my-6 mt-2 border mx-auto text-center hover:bg-gray-200"
              >
                {p.playerName}
              </Link>
            );
          })}
        </div>
        <div className="w-full pb-4 bg-gray-100 ">
          <div className="text-3xl text-center py-8 ">Featured Tournaments</div>
          <div className="flex flex-col justify-center ">
            {FEATURED_TOURNAMENTS.map((t) => {
              return (
                <div key={t.id} className="mx-auto my-3">
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="inline-block w-80 rounded py-4 px-4 border mx-auto text-center bg-white hover:bg-gray-200"
                  >
                    {t.name}
                  </Link>
                </div>
              );
            })}{" "}
            <Link href="/tournaments" className="mt-4 mx-auto text-blue-400">
              See All Tournaments
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
