import React, { useState } from "react";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import Head from "next/head";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import { PrismaClient } from "@prisma/client";
import { Button, Grid } from "@mui/material";
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
  finalRank?: number;
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
  tournamentsPerGame: Tournament;
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
const Player: React.FC<Props> = ({ playerData, tournamentsPerGame }) => {
  const [game, setGame] = useState<Game>("smashsp");

  const [isAccordionExpand, setIsAccordionExpand] = useState<{
    [id: number]: boolean;
  }>(
    tournamentsPerGame[game].reduce(
      (prev: { [s: number]: boolean }, tournament) => {
        prev[tournament.id] = false;
        return prev;
      },
      {}
    )
  );
  const handleAccordingClick = (i: number) => {
    const newState = { ...isAccordionExpand };
    newState[i] = !isAccordionExpand[i];
    setIsAccordionExpand(newState);
  };
  const flipAllAccordionState = () => {
    const newState = tournamentsPerGame[game].reduce(
      (prev: { [s: number]: boolean }, tournament) => {
        prev[tournament.id] = !isAccordionExpand[tournament.id];
        return prev;
      },
      {}
    );
    setIsAccordionExpand(newState);
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      setGame("smashsp");
    } else if (newValue === 1) {
      setGame("smash4");
    } else {
      setGame("melee");
    }
  };
  return (
    <Layout>
      <Head>
        <title>{playerData.name}</title>
      </Head>
      <section>
        <h1>{playerData.name}</h1>
        <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 1 }}>
          <Tabs
            value={gameToTabId[game]}
            onChange={handleTabChange}
            aria-label="smash game tabs"
          >
            {tournamentsPerGame["smashsp"].length !== 0 && (
              <Tab label="Smash SP" />
            )}
            {tournamentsPerGame["smash4"].length !== 0 && (
              <Tab label="Smash 4" />
            )}
            {tournamentsPerGame["melee"].length !== 0 && <Tab label="Melee" />}
          </Tabs>
        </Box>
        <Grid container justifyContent="flex-end" mt={1} mb={1}>
          <Button
            onClick={flipAllAccordionState}
            color="secondary"
            variant="contained"
          >
            Open All Record
          </Button>
        </Grid>
        {tournamentsPerGame[game].map((tournament) => {
          return (
            <Box key={tournament.id} sx={{ margin: "12px 0" }}>
              <Accordion
                disableGutters
                square
                sx={{
                  border: "1px solid #ccc",
                  borderBottom: 0,
                }}
                expanded={isAccordionExpand[tournament.id] || false}
              >
                <AccordionSummary
                  onClick={() => handleAccordingClick(tournament.id)}
                >
                  <Grid container alignItems={"center"}>
                    <Grid
                      item
                      xs={9}
                      sx={{
                        paddingRight: 2,
                      }}
                    >
                      <Typography>{tournament.name}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2">{tournament.date}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography variant="body2">
                        {ordinal(tournament.finalRank)}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    padding: 0,
                  }}
                >
                  <>
                    {tournament.records.map((record) => {
                      return (
                        <Grid
                          container
                          justifyContent={"space-between"}
                          key={record.roundStr}
                          sx={{
                            backgroundColor:
                              record.myScore > record.opponentScore
                                ? "#9ad29c"
                                : "#ea8f8f",
                            padding: 1,
                            borderTop: "1px solid #ccc",
                            borderBottom: "1px solid #ccc",
                          }}
                        >
                          <Grid item xs={4}>
                            <Link href={`/players/${record.opponentId}`}>
                              {record.opponentName}
                            </Link>
                          </Grid>
                          <Grid
                            item
                            xs={4}
                            sx={{
                              textAlign: "center",
                            }}
                          >
                            {record.roundStr}
                          </Grid>
                          <Grid
                            item
                            xs={4}
                            sx={{
                              textAlign: "right",
                            }}
                          >{`${record.myScore} - ${record.opponentScore}`}</Grid>
                        </Grid>
                      );
                    })}
                  </>
                </AccordionDetails>
              </Accordion>
            </Box>
          );
        })}
      </section>
    </Layout>
  );
};

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
  const ret: TournamentsPerGame = { melee: [], smash4: [], smashsp: [] };
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
};

export default Player;
