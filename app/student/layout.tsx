"use client"
import "../globals.css";
import Navbar from "../components/Navbar";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import {SessionProvider } from "next-auth/react"

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function StudentLayout({
  children,
  session
}: {
  children: React.ReactNode;
  session : any
}) {
  return (
    <html lang="ar">
      <SessionProvider session = {session} >
      <body>
        <Navbar />
        {children}
        <Menu />
        <Footer />
      </body>
      </SessionProvider>
    </html>
  );
}
