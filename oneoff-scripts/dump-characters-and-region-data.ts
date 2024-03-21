import { PrismaClient } from "@prisma/client";

// Produced https://docs.google.com/spreadsheets/d/1W-VvNlD-XZAcZUW9K42SSUI1coHf8S45V-0djGv_v4k/edit#gid=0

(async () => {
  const prisma = new PrismaClient();
  const players = await prisma.player.findMany({
    where: {
      is_valid: true
    },
  });
  const locations = await prisma.location.findMany();
  const playerCharas = (await prisma.player_chara.findMany()).filter((r) => r.end_date == null);
  console.log("Player id\tPlaner Name\tPlayer Name(Eng)\tRegion\tRegion(Eng)\tSmashsp main 1\tSmashsp main 2\tSmashsp main 3\tSmashsp sub 1\tSmashsp sub 2\tSmashsp sub 3\tSmash 4 main 1\tSmash 4 main 2\tSmash 4 main 3\tSmash 4 sub 1\tSmash 4 sub 2\tSmash 4 sub 3\Melee main 1\tMelee main 2\tMelee main 3\tMelee sub 1\tMelee sub 2\tMelee sub 3");
  players.forEach((player) => {
    const location = locations.find((location) => location.id === player.location_id)!;
    const characters = playerCharas.filter((pc) => pc.player_id === player.id);
    const smashspmains = characters.filter((c) => c.game === "smashsp" && c.type === "main");
    const smashspsubs = characters.filter((c) => c.game === "smashsp" && c.type === "sub");
    const smash4mains = characters.filter((c) => c.game === "smash4" && c.type === "main");
    const smash4subs = characters.filter((c) => c.game === "smash4" && c.type === "sub");
    const meleemains = characters.filter((c) => c.game === "melee" && c.type === "main");
    const meleesubs = characters.filter((c) => c.game === "melee" && c.type === "sub");
    
    process.stdout.write(String(player.id));
    process.stdout.write("\t");
    process.stdout.write(player.name);
    process.stdout.write("\t");
    process.stdout.write(player.name_eng || "");
    process.stdout.write("\t");
    process.stdout.write(location ? location.name_jpn : "");
    process.stdout.write("\t");
    process.stdout.write(location ? location.name_eng : "");
    process.stdout.write("\t");
    [smashspmains, smashspsubs, smash4mains, smash4subs, meleemains, meleesubs].forEach((arr) => {
      arr.forEach((c) => {
        process.stdout.write(c.chara);
        process.stdout.write("\t");
      });
      for (let i = 0; i < 3 - arr.length; i++) {
        process.stdout.write("\t");
      }
    });
    process.stdout.write("\n");
  });

})();