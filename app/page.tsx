'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const session = useSession({ required: true });


  const router = useRouter();
  const user = session.data?.user;
  useEffect(() => {
    if(user?.userType=='admin')
    router.push('/management/announcements');
    if (user?.userType == 'doctor') router.push('/doctor/announcements');
    if (user?.userType == 'student') router.push('/student/announcements');
  }, [router, user?.userType]);

  return (
    <div></div>
  );
}

