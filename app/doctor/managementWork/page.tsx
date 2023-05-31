import { useSession } from 'next-auth/react';
import React from 'react';

const Page = () => {
    const session = useSession({ required: true });
    // if user isn't a admin, throw an error
    const user = session.data?.user;
  return (
    <div>
      
    </div>
  );
};

export default Page;
