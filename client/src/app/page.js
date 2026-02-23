import { cookies } from "next/headers";
import Greet from "@/components/Greet";

export default async function Page() {
  const cookieStore = await cookies();
  const val = cookieStore.get('COOKIE');

  let userData = null;
  
  try {
    if (val && val.value !== "undefined") {
      userData = JSON.parse(val.value);
    }
  } catch (error) {
    console.error("Corrupt cookie found:", error);
    userData = null; 
  }

  return (
    <div>
      <h1>This is a server component</h1>
      {userData ? <h1>Hii {userData.name}</h1> : <h1>Welcome, Guest</h1>}
      <Greet cookie_value={userData}/>
    </div>
  );
}