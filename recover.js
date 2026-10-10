const{PrismaClient}=require("@prisma/client");
const prisma=new PrismaClient();
async function main(){
  const updates=[
    {name:"Nana Afia Agyeiwaa Aboagye",votes:10},
    {name:"Emmanuel Frimpong Asante",votes:3},
    {name:"Joel Owusu Berko",votes:21},
    {name:"Adu Minka Junior",votes:19},
    {name:"Winslette Nana Achiaa Twum",votes:1},
    {name:"Allen Claire Lucy Ameyaw",votes:2},
  ];
  for(const u of updates){
    const c=await prisma.contestant.findFirst({where:{name:u.name}});
    if(!c){console.log("NOT FOUND: "+u.name);continue;}
    await prisma.contestant.update({where:{id:c.id},data:{votes:{increment:u.votes}}});
    console.log("Added "+u.votes+" votes to "+u.name);
  }
  console.log("Done");
}
main().catch(console.error).finally(()=>prisma.disconnect());
