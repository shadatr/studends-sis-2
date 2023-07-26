import "../globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ManagMenu from "../components/ManagMenu";

export const metadata = {
  title: "جامعة طرابلس | الادارة",
};

export default function MangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <>
        <Navbar />
        {children}
        <ManagMenu/>
        <Footer />
      </>
  );
}
