'use client';

import React from 'react';
import Transcript from '@/app/components/transcript';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  // if the user isn't an admin, throw an error
  if (session.data?.user ? session.data?.user?.userType !== 'student' : false) {
    redirect('/');
  }

  const user = session.data?.user;


  return (
    <div >
      {user?.major && (
        <Transcript majorId={user?.major} user={user?.id} />
      )}
    </div>
  );
};

export default Page;
