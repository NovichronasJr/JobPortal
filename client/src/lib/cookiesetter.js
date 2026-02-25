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
  
  if (!cookie.value || cookie.value.trim() === "" || cookie.value === "undefined") {
      return null;
  }
  
  try {

      if (cookie.value.startsWith('{') || cookie.value.startsWith('[')) {
          return JSON.parse(cookie.value);
      }
      
      return null; 
  } catch (error) {
      console.error("Session data corrupted, clearing reference.");
      return null;
  }
}