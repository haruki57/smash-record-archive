import Image from "next/image";
import { Inter } from "next/font/google";
import useSWR from "swr";
import { useMemo, useState } from "react";
import Footer from "@/components/footer";
import Link from "next/link";
import Layout from "@/components/layout";

const inter = Inter({ subsets: ["latin"] });

const fetcher = (...args: any) => fetch(args).then((res) => res.text());

export default function Home() {
  // Tsv
  // playerId \t playerName \t aliases
  // aliases can be empty
  // Players are ordered by number of wins.
  const { data: playerDataTsv, error } = useSWR("/master.txt", fetcher);
  const [text, setText] = useState("");
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
        const playerStr = (p.playerName + p.aliases).toLowerCase();
        return playerStr.indexOf(text.toLowerCase()) >= 0;
      })
      .slice(0, 100)
      .map((p) => {
        return { playerId: p.playerId, playerName: p.playerName };
      });
  }, [text, playerData]);

  if (!playerData) {
    return;
  }
  return (
    <>
      <main className="mx-auto flex min-h-screen flex-col items-center">
        <div className="w-full py-32 bg-gray-100 flex justify-center">
          <div>
            <div className="mx-full">
              <input
                type="text"
                value={text}
                placeholder="プレイヤー名で検索"
                onChange={(e) => setText(e.target.value)}
                className="w-60 rounded border-2"
              />
            </div>

            <div className="overflow-auto overflow-y-scroll h-28">
              {text.length > 0 && matchedPlayers.length > 0 && (
                <div className="p-2 border rounded">
                  {matchedPlayers.map((p) => {
                    return (
                      <div key={p.playerId}>
                        <Link href={`/players/${p.playerId}`}>
                          {p.playerName}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {/* <div>{text}</div> */}
        </div>
        <div>
          <div>Featured Players</div>
          <div className="flex justify-beetween">
            <div>
              <Link href="/players/5355">HIKARU</Link>
            </div>
            <div>
              <Link href="/players/5355">HIKARU</Link>
            </div>
            <div>
              <Link href="/players/5355">HIKARU</Link>
            </div>
          </div>
        </div>
        {/* <div>{JSON.stringify(playerData)}</div> */}
      </main>
      <Footer />
    </>
  );
}
