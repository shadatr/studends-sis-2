'use client';
import { redirect } from "next/navigation";



export default function Home() {
  redirect("/login/student");
  return <div>hello world</div>;
}


