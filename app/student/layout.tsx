import "../globals.css";
import Navbar from "../components/Navbar";
import Menu from "../components/studentMenu";
import Footer from "../components/Footer";


export const metadata = {
  title: 'جامعة طرابلس | الطلاب',
};

export default function studentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Menu />
      <Footer />
    </>
  );
}
