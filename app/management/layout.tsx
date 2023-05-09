import "../globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import ManagMenu from "./ManagMenu";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function MangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body >
        <Navbar />
        {children}
        <ManagMenu/>
        <Footer />
      </body>
    </html>
  );
}
