"use server"
import { cookies } from "next/headers";

/**

 * @param {Object} params 
 */
export async function cookieSetter(params) {
  const cookieStore = await cookies();

  const { token, user } = params;

  await cookieStore.set({
    name: 'COOKIE',
    value: JSON.stringify({ token, user }),
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 60 * 60 * 24,
    path: '/', 
  });

  return { message: "success" };
}

export async function checkCookie() {
  const cookieStore = await cookies();
  return cookieStore.has('COOKIE');
}

export async function deleteCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("COOKIE");
  return { message: "deleted cookie" };
}


export async function cookieGetter() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('COOKIE');
    
    if (!cookie) return null;
    
    try {
        return JSON.parse(cookie.value);
    } catch (error) {
        console.error("Failed to parse session cookie:", error);
        return null;
    }
}