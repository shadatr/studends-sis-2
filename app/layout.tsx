'use client';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import { SessionProvider } from 'next-auth/react';


export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <html lang="ar">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
        <ToastContainer position="bottom-right" autoClose={2000} rtl={true} />
      </body>
    </html>
  );
}
