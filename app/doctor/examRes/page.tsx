'use client';
import { SectionType } from '@/app/types/types'; 
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }
  // if user isn't a admin, throw an error
  const user = session.data?.user;
  const [sections, setSections] = useState<SectionType[]>([]);


    useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/course/courses/${user?.id}/doctor`
      );
      const message: SectionType[] = response.data.message;
      setSections(message);
    };
    fetchPosts();
  }, [user?.id]);

  return (
    <div className=" w-[80%] justify-center items-center flex p-10 absolute">
      <table className=" w-[800px] border-collapse">
        <th className="border px-4 py-2 bg-darkBlue text-secondary">
          اسم المادة
        </th>
        <tbody>
          {sections.map((item, index) => (
            <Link
              key={index}
              href={`/doctor/examRes/courseStudents/${item.id}`}
            >
              <tr className="w-full flex">
                <td className="border px-4 py-2 w-full bg-lightBlue">{item.name}</td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
