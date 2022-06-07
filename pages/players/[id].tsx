import React from 'react'
import { GetServerSideProps } from 'next'
import Layout from '../../components/Layout'
import { PrismaClient, tournament_tournament_type } from "@prisma/client";

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
  finalRank?: number;
  records: Record[];
};

type TounamentsPerGame = {
  smashsp: Tournament[];
  smash4: Tournament[];
  melee: Tournament[];
};
type Props = {
  playerData: {
    name: string;
    nameEng: string;
  };  
  tournamentsPerGame: Tournament;
}
const Player: React.FC<Props> = props => {
  return (
    <Layout>
      <div>
        {`${props.playerData.name} / ${props.playerData.nameEng}`}
        </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // const res = await fetch(`http://localhost:3100/api/players/${context.params.id}`)
  // const data = await res.json()
  // return { props: { ...data } }
  const { params } = context;

  if (!params || !params.id) {
    return { notFound: true };
  }
  if (typeof params.id !== "string") {
    return { notFound: true };
  }
  const prisma = new PrismaClient();
  const playerId = parseInt(params?.id);
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return { notFound: true };
  }
  const recordRows = await prisma.record.findMany({
    where: { OR: [{ winner_id: playerId }, { loser_id: playerId }] },
    orderBy: [
      { tournament_id: "desc" },
      { phase_order: "desc" },
      { round: "desc" },
    ],
  });
  if (!recordRows) {
    return { notFound: true };
  }

  const tournaments = await prisma.tournament.findMany({
    where: { id: { in: recordRows.map((r) => r.tournament_id || -1) } },
    orderBy: [{ date: "desc" }],
  });

  const finalRanks: any[] =
    (await prisma.$queryRaw`select * from final_rank where player_id = ${playerId}`) ||
    [];
  const tournamentIdToFinalRank: { [s: number]: number } = {};
  finalRanks.forEach((finalRank) => {
    tournamentIdToFinalRank[finalRank.tournament_id] = finalRank.final_rank;
  });
  const ret: TounamentsPerGame = { melee: [], smash4: [], smashsp: [] };
  tournaments.forEach((tournament) => {
    ret[tournament.game].push({
      id: tournament.id,
      name: tournament.display_name,
      date: tournament.date.toLocaleDateString("ja-JP"),
      finalRank: tournamentIdToFinalRank[tournament.id],
      records: [],
    });
  });

  recordRows.forEach((record) => {
    const round = record.round;
    const phaseName = record.phase_name;
    let roundStr = phaseName ? phaseName + " " : "";
    if (round < 100) {
      roundStr += " (W) #" + round;
    } else if (round < 10000) {
      roundStr += " (L) #" + (round - 100);
    } else if (round === 10000) {
      roundStr += "GF";
    } else {
      roundStr += "GF2";
    }
    let opponentName;
    let opponentId;
    let myScore;
    let opponentScore;
    if (record.winner_id === playerId) {
      opponentName = record.loser;
      opponentId = record.loser_id || 0;
      myScore = record.winner_score || 0;
      opponentScore = record.loser_score || 0;
    } else {
      opponentName = record.winner;
      opponentId = record.winner_id || 0;
      myScore = record.loser_score || 0;
      opponentScore = record.winner_score || 0;
    }
    const data: Record = {
      tournamentId: record.tournament_id || 0,
      opponentName,
      opponentId,
      myScore,
      opponentScore,
      roundStr,
    };
    const tournament = ret[record.game].find(
      (tournament) => tournament.id === record.tournament_id
    );
    if (!tournament) {
      return;
    }
    tournament.records.push(data);
  });

  return {
    props: {
      playerData: {
        name: player.name,
        nameEng: player.name_eng,
      },
      tournamentsPerGame: ret,
    },
  };
}

export default Player
