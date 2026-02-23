"use server"
import { cookies } from "next/headers";

// Use named exports instead of multiple defaults
export async function cookieSetter(params) {
  const cookieStore = await cookies();

  const { name, email, role } = params;

  await cookieStore.set({
    name: 'COOKIE',
    value: JSON.stringify({ name, email, role }),
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

export async function cookieGetter(cookie_name){
    const cookieStore = await cookies();
    return await cookieStore.get(cookie_name)
}