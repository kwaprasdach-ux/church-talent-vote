const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const c = [
  {n:"Adu Minka Junior",code:"ADY-001",p:"/contestants/Adu Minka Junior.jpg"},
  {n:"Emmanuella Nimo",code:"ADY-002",p:"/contestants/Emmanuella Nimo.jpg"},
  {n:"Emmanuel Frimpong Asante",code:"ADY-003",p:"/contestants/Emmanuel Frimpong Asante.jpg"},
  {n:"Adu Minka Senior",code:"ADY-004",p:"/contestants/Adu Minka Senior.jpg"},
  {n:"Eliot Donkor",code:"ADY-005",p:"/contestants/Eliot Donkor.jpg"},
  {n:"Ariana Afiriyie Twum",code:"ADY-006",p:"/contestants/Ariana Afriyie Twum.jpg"},
  {n:"Nana Afia Agyeiwaa Aboagye",code:"ADY-007",p:"/contestants/Nana Afia Agyeiwaa Aboagye.jpg"},
  {n:"Winslette Nana Achiaa Twum",code:"ADY-008",p:"/contestants/Winslette Nana Achiaa Twum.jpg"},
  {n:"Ezekiel Amoako",code:"ADY-009",p:"/contestants/Ezekiel Amoako.jpg"},
  {n:"Kelvin Baffour",code:"ADY-010",p:"/contestants/Kelvin Baffour.jpg"},
  {n:"Ohemaa Adowa Owusu Berko",code:"ADY-011",p:"/contestants/Ohemaa Adowa Owusu Berko.jpg"},
  {n:"Nana Akua Aboagyewaa Boamposem",code:"ADY-012",p:"/contestants/Nana Akua Aboagyewaa Boamponsem.jpg"},
  {n:"Lois Gyamfua Ameyaw",code:"ADY-013",p:"/contestants/Lois Gyamfua Ameyaw.jpg"},
  {n:"Spendilove Konadu Frimpong",code:"ADY-014",p:"/contestants/Spendilove Konadu Frimpong.jpg"},
  {n:"Chris Owusu",code:"ADY-015",p:"/contestants/chris Owusu.jpg"},
  {n:"Adepa Kusiwaa Gyamfi",code:"ADY-016",p:"/contestants/Adepa Kusiwaa Gyamfi.jpg"},
  {n:"Joel Owusu Berko",code:"ADY-017",p:"/contestants/Joel Owusu Berko.jpg"},
  {n:"Mary Osei Gyamfua",code:"ADY-018",p:"/contestants/Mary Osei Gyamfua.jpg"},
  {n:"Dorcas Kankam Boadu",code:"ADY-019",p:"/contestants/Dorcas Kankam Boadu.jpg"},
  {n:"Irene Pokuaa Frimpong",code:"ADY-020",p:"/contestants/Irene Pokuaa Frimpong.jpg"},
  {n:"Francisa Kankam Boadu",code:"ADY-021",p:null},
  {n:"Allen Claire Lucy Ameyaw",code:"ADY-022",p:null},
  {n:"Daniel",code:"ADY-023",p:null},
];
async function main(){
  await prisma.contestant.deleteMany();
  for(let i=0;i<c.length;i++){
    await prisma.contestant.create({data:{name:c[i].n,code:c[i].code,act:null,photoUrl:c[i].p,order:i,votes:0}});
    console.log(c[i].code+" - "+c[i].n);
  }
  console.log("Done");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
