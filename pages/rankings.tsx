import React from "react";
import Layout from "@/components/layout";
import Link from "next/link";
import Head from "next/head";

const RankingsSmashsp: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Rankings - Smash Record</title>
        <meta name="description" content={"Rankings page of Smash Record"} />
      </Head>
      <div className="m-10">
        <div className="m-2">
          <div className="mb-4">スマッシュ4</div>
          <div className="m-4">
            <div>
              See{" "}
              <a
                href="https://www.ssbwiki.com/JAPAN_Power_Rankings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400"
              >
                Smashwiki
              </a>
            </div>
            <div>
              <a
                href="https://www.youtube.com/watch?v=fxP3Yz5D198&list=PL1sSbHUu9nXBJcYX9rA8zy0bLZ4_LHVBm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400"
              >
                Movies for JPR V3
              </a>
            </div>
            <div>
              <a
                href="https://twitter.com/Smash_JPR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400"
              >
                Movies for JPR 2018
              </a>
            </div>
          </div>
        </div>
        <div className="m-2">
          <div className="mb-4">スマッシュSP</div>
          <div className="m-4">
            See These Articles:
            <div>
              <a
                href="https://www.redbull.com/jp-ja/smabros-sp-player-ranking2019-firsthalf-top30"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400"
              >
                『スマブラSP』:2019年(上半期)国内プレイヤーランキング トップ30
              </a>
            </div>
            <div>
              <a
                href="https://www.redbull.com/jp-ja/smabros-sp-player-ranking2019-secondhalf-top30"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400"
              >
                『スマブラSP』:2019年(下半期)国内プレイヤーランキング トップ30
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default RankingsSmashsp;
