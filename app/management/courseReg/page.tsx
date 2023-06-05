/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  MajorRegType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';


const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;

  const [majors, setMajors] = useState<MajorRegType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      
      axios.get('/api/major/majorReg').then((resp) => {
        console.log(resp.data);
        const message: MajorRegType[] = resp.data.message;
        setMajors(message);
      });
    };
    fetchPosts();
  }, []);

  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
        تخصصات
      </p>
      <table className="w-[1000px] flex flex-col">
        <tbody>
          {majors.map((item, index) => (
            <tr key={index} className="flex flex-row w-full">
              <td className="flex flex-row w-full p-1 items-center justify-end">
                <Link href={`/management/course/${item.id}`}>
                  {item.major_name}
                </Link>
              </td>
              <td className="flex flex-row w-1/5 items-center justify-center pr-2 pl-2">
                {item.tb_departments?.name}
              </td>
              <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default page;
