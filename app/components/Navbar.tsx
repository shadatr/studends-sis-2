'use client';
import { useSession, signOut } from 'next-auth/react';
import React from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { BiLogOut } from 'react-icons/bi';

const Navbar = () => {
  const session = useSession();
  return (
    <div className="flex justify-between text-lg text-left p-[35px] bg-darkBlue text-secondary">
      <p>جامعة طرابلس</p>
      <div className="flex items-center">
        <button>
          <AiOutlineUser className="h-8" />
        </button>
        <p className="text-sm">{session.data?.user.name}</p>
        <button onClick={() => signOut({ redirect: true, callbackUrl : "/api/auth/signin" })}>
          <BiLogOut className="h-8" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
