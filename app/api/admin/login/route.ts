import{NextRequest,NextResponse}from"next/server";
import{ADMIN_COOKIE,checkPassword,expectedToken}from"@/lib/auth";
export async function POST(req:NextRequest){
  const{password}=await req.json();
  if(typeof password!=="string"||!checkPassword(password))return NextResponse.json({error:"Incorrect password"},{status:401});
  const token=await expectedToken();
  const res=NextResponse.json({ok:true});
  res.cookies.set(ADMIN_COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*12});
  return res;
}
export async function DELETE(){
  const res=NextResponse.json({ok:true});
  res.cookies.set(ADMIN_COOKIE,"",{path:"/",maxAge:0});
  return res;
}
