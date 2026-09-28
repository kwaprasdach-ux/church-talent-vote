const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Photos are named exactly as the person's name in the CONTESTANTS PICTURES folder
// 3 contestants have no photo: Francisa Kankam Boadu, Allen Claire Lucy Ameyaw, Daniel
const contestants = [
  { name: "Adu Minka Junior",               photo: "/contestants/Adu Minka Junior.jpg" },
  { name: "Emmanuella Nimo",                photo: "/contestants/Emmanuella Nimo.jpg" },
  { name: "Emmanuel Frimpong Asante",       photo: "/contestants/Emmanuel Frimpong Asante.jpg" },
  { name: "Adu Minka Senior",               photo: "/contestants/Adu Minka Senior.jpg" },
  { name: "Eliot Donkor",                   photo: "/contestants/Eliot Donkor.jpg" },
  { name: "Ariana Afiriyie Twum",           photo: "/contestants/Ariana Afriyie Twum.jpg" },
  { name: "Nana Afia Agyeiwaa Aboagye",     photo: "/contestants/Nana Afia Agyeiwaa Aboagye.jpg" },
  { name: "Winslette Nana Achiaa Twum",     photo: "/contestants/Winslette Nana Achiaa Twum.jpg" },
  { name: "Ezekiel Amoako",                 photo: "/contestants/Ezekiel Amoako.jpg" },
  { name: "Kelvin Baffour",                 photo: "/contestants/Kelvin Baffour.jpg" },
  { name: "Ohemaa Adowa Owusu Berko",       photo: "/contestants/Ohemaa Adowa Owusu Berko.jpg" },
  { name: "Nana Akua Aboagyewaa Boamposem", photo: "/contestants/Nana Akua Aboagyewaa Boamponsem.jpg" },
  { name: "Lois Gyamfua Ameyaw",            photo: "/contestants/Lois Gyamfua Ameyaw.jpg" },
  { name: "Spendilove Konadu Frimpong",     photo: "/contestants/Spendilove Konadu Frimpong.jpg" },
  { name: "Chris Owusu",                    photo: "/contestants/chris Owusu.jpg" },
  { name: "Adepa Kusiwaa Gyamfi",           photo: "/contestants/Adepa Kusiwaa Gyamfi.jpg" },
  { name: "Joel Owusu Berko",               photo: "/contestants/Joel Owusu Berko.jpg" },
  { name: "Mary Osei Gyamfua",              photo: "/contestants/Mary Osei Gyamfua.jpg" },
  { name: "Dorcas Kankam Boadu",            photo: "/contestants/Dorcas Kankam Boadu.jpg" },
  { name: "Irene Pokuaa Frimpong",          photo: "/contestants/Irene Pokuaa Frimpong.jpg" },
  { name: "Francisa Kankam Boadu",          photo: null },
  { name: "Allen Claire Lucy Ameyaw",       photo: null },
  { name: "Daniel",                         photo: null },
];

async function main() {
  console.log("Re-seeding contestants...");
  await prisma.contestant.deleteMany();
  for (let i = 0; i < contestants.length; i++) {
    const c = contestants[i];
    await prisma.contestant.create({
      data: { name: c.name, act: null, photoUrl: c.photo, order: i, votes: 0 },
    });
    console.log(`  ${i + 1}. ${c.name} ${c.photo ? "📷" : "(no photo)"}`);
  }
  console.log(`\nDone — ${contestants.length} contestants added.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
