import '../globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DoctorMenu from '../components/DoctorMenu';

export const metadata = {
  title: 'جامعة طرابلس | الدكاترة',
};


export default function MangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <DoctorMenu />
      {children}
      <Footer />
    </>
  );
}
