'use client';
import { useSession, signOut } from 'next-auth/react';
import React from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { BiUser } from 'react-icons/bi';

const Navbar = () => {
  const session = useSession({ required: true });
  return (
    <div className="flex justify-between text-lg text-left p-[35px] bg-darkBlue text-secondary">
      <p>جامعة طرابلس</p>
      <div className='flex items-center'>
      <BiUser className='h-6 hover:cursor-pointer'/>
        <p className='text-[20px]'>{session.data?.user.name} {session.data?.user.surname}</p>
      <button onClick={() => signOut({ redirect: true})}>
        < AiOutlineLogout className='h-6'/>
      </button>
      </div>
    </div>
  );
};

export default Navbar;
