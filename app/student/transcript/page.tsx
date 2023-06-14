'use client';

import React from 'react';
import Transcript from '@/app/components/transcript';
import { useSession } from 'next-auth/react';

const Page = () => {
  const session = useSession({ required: true });
  // if the user isn't an admin, throw an error
  if (session.data?.user ? session.data?.user?.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;



  return (
    <div>
      <Transcript user={user? user.id: 0} />
    </div>
  );
};

export default Page;
