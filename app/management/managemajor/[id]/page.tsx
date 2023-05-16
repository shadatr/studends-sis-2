import { useSession } from 'next-auth/react';

export default function Page({ params }: { params: { id: string } }) {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  return <h1>My Page</h1>;
}
