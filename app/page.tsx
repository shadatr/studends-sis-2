'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Home() {
  const session = useSession({ required: true });

  return (
    <div className='flex justify-center items-center h-full flex-col'>
      <h1 className='text-3xl'>Welcome {session.data?.user.name}</h1>
      <p className='text-lg'>This page should be private</p>
      <p className='text-red-600 text-sm hover:cursor-pointer' onClick={() => signOut()}>logout</p>
    </div>
  );
}

