const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const contestants = [
  { name: "Nana Akua Aboagyewaa Boamposem", act: null, photoUrl: "/contestants/1.jpg"  },
  { name: "Allen Claire Lucy Ameyaw",        act: null, photoUrl: "/contestants/2.jpg"  },
  { name: "Winslette Nana Achiaa Twum",      act: null, photoUrl: "/contestants/3.jpg"  },
  { name: "Ariana Afiriyie Twum",            act: null, photoUrl: "/contestants/4.jpg"  },
  { name: "Ezekiel Amoako",                  act: null, photoUrl: "/contestants/5.jpg"  },
  { name: "Eliot Donkor",                    act: null, photoUrl: "/contestants/6.jpg"  },
  { name: "Genesis Oheneba Osei Kusi",       act: null, photoUrl: "/contestants/7.jpg"  },
  { name: "Emmanuel Frimpong Asante",        act: null, photoUrl: "/contestants/8.jpg"  },
  { name: "Chris Owusu",                     act: null, photoUrl: "/contestants/9.jpg"  },
  { name: "Lois Gyamfua Ameyaw",             act: null, photoUrl: "/contestants/10.jpg" },
  { name: "Ohemaa Adowa Owusu Berko",        act: null, photoUrl: "/contestants/11.jpg" },
  { name: "Irene Pokuaa Frimpong",           act: null, photoUrl: "/contestants/12.jpg" },
  { name: "Spendilove Konadu Frimpong",      act: null, photoUrl: "/contestants/13.jpg" },
  { name: "Mary Osei Gyamfua",               act: null, photoUrl: "/contestants/14.jpg" },
  { name: "Adelaide Appiah",                 act: null, photoUrl: "/contestants/15.jpg" },
  { name: "Nana Afia Agyeiwaa Aboagye",      act: null, photoUrl: "/contestants/16.jpg" },
  { name: "Benjamin Frimpong",               act: null, photoUrl: "/contestants/17.jpg" },
  { name: "Godfred Boakye",                  act: null, photoUrl: "/contestants/18.jpg" },
  { name: "Dorcas Kankam Boadu",             act: null, photoUrl: "/contestants/19.jpg" },
  { name: "Francisa Kankam Boadu",           act: null, photoUrl: "/contestants/20.jpg" },
  { name: "Joel Owusu Berko",                act: null, photoUrl: "/contestants/21.jpg" },
  { name: "Adepa Kusiwaa Gyamfi",            act: null, photoUrl: "/contestants/22.jpg" },
  { name: "Emmanuella Nimo",                 act: null, photoUrl: null },
  { name: "Adu Minka Junior",                act: null, photoUrl: null },
  { name: "Adu Minka Senior",                act: null, photoUrl: null },
  { name: "Kelvin Baffour",                  act: null, photoUrl: null },
  { name: "Diana Nimo",                      act: null, photoUrl: null },
];

async function main() {
  console.log("Seeding contestants...");
  await prisma.contestant.deleteMany();
  for (let i = 0; i < contestants.length; i++) {
    const c = contestants[i];
    await prisma.contestant.create({
      data: { name: c.name, act: c.act, photoUrl: c.photoUrl, order: i, votes: 0 },
    });
    console.log(`  ${i + 1}. ${c.name}`);
  }
  console.log(`\nDone — ${contestants.length} contestants added.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
