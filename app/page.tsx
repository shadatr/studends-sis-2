'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Home() {
  useSession({ required: true });

  return (
    <div className='flex justify-center items-center h-full flex-col'>
      <p className='text-lg'>This page should be private</p>
      <p className='text-red-600 text-sm hover:cursor-pointer' onClick={() => signOut()}>logout</p>
    </div>
  );
}

interface UserSwitchProps {
  student: boolean;
  setStudent: (student: boolean) => void;
}
