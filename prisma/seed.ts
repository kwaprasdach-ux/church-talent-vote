import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Photos 1.jpg–22.jpg map to contestants 1–22 in order.
// Contestants 23–27 have no photo yet.
const contestants = [
  { name: "Nana Akua Aboagyewaa Boamposem", act: null, photo: "/contestants/1.jpg"  },
  { name: "Allen Claire Lucy Ameyaw",        act: null, photo: "/contestants/2.jpg"  },
  { name: "Winslette Nana Achiaa Twum",      act: null, photo: "/contestants/3.jpg"  },
  { name: "Ariana Afiriyie Twum",            act: null, photo: "/contestants/4.jpg"  },
  { name: "Ezekiel Amoako",                  act: null, photo: "/contestants/5.jpg"  },
  { name: "Eliot Donkor",                    act: null, photo: "/contestants/6.jpg"  },
  { name: "Genesis Oheneba Osei Kusi",       act: null, photo: "/contestants/7.jpg"  },
  { name: "Emmanuel Frimpong Asante",        act: null, photo: "/contestants/8.jpg"  },
  { name: "Chris Owusu",                     act: null, photo: "/contestants/9.jpg"  },
  { name: "Lois Gyamfua Ameyaw",             act: null, photo: "/contestants/10.jpg" },
  { name: "Ohemaa Adowa Owusu Berko",        act: null, photo: "/contestants/11.jpg" },
  { name: "Irene Pokuaa Frimpong",           act: null, photo: "/contestants/12.jpg" },
  { name: "Spendilove Konadu Frimpong",      act: null, photo: "/contestants/13.jpg" },
  { name: "Mary Osei Gyamfua",               act: null, photo: "/contestants/14.jpg" },
  { name: "Adelaide Appiah",                 act: null, photo: "/contestants/15.jpg" },
  { name: "Nana Afia Agyeiwaa Aboagye",      act: null, photo: "/contestants/16.jpg" },
  { name: "Benjamin Frimpong",               act: null, photo: "/contestants/17.jpg" },
  { name: "Godfred Boakye",                  act: null, photo: "/contestants/18.jpg" },
  { name: "Dorcas Kankam Boadu",             act: null, photo: "/contestants/19.jpg" },
  { name: "Francisa Kankam Boadu",           act: null, photo: "/contestants/20.jpg" },
  { name: "Joel Owusu Berko",                act: null, photo: "/contestants/21.jpg" },
  { name: "Adepa Kusiwaa Gyamfi",            act: null, photo: "/contestants/22.jpg" },
  { name: "Emmanuella Nimo",                 act: null, photo: null },
  { name: "Adu Minka Junior",                act: null, photo: null },
  { name: "Adu Minka Senior",                act: null, photo: null },
  { name: "Kelvin Baffour",                  act: null, photo: null },
  { name: "Diana Nimo",                      act: null, photo: null },
];

async function main() {
  console.log("Seeding contestants…");

  // Clear existing so re-running is safe
  await prisma.contestant.deleteMany();

  for (let i = 0; i < contestants.length; i++) {
    const c = contestants[i];
    await prisma.contestant.create({
      data: {
        name:     c.name,
        act:      c.act,
        photoUrl: c.photo,
        order:    i,
        votes:    0,
      },
    });
    console.log(`  ${i + 1}. ${c.name} ${c.photo ? "📷" : "(no photo)"}`);
  }

  console.log(`\nDone — ${contestants.length} contestants added.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
