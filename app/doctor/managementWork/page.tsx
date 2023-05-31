'use client';
import { MajorType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';


const Page = () => {

  const session = useSession({ required: true });

  const user = session.data?.user;

  const [majors, setMajors] = useState<MajorType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/major/getMajors/${user?.head_of_deparment_id}`
      );
      const message: MajorType[] = response.data.message;
      setMajors(message);
      console.log(message);
    };
    fetchPosts();
  }, [user?.head_of_deparment_id]);


  return (
    <div className="flex absolute items-center justify-center w-[80%] mt-10">
      <table className="w-[800px]">
        <th className="p-2 bg-darkBlue text-secondary">اسم التخصص</th>
        {majors.map((major, index) => (
          <tr key={index}>
            <Link href={`/doctor/managementWork/major/${major.id}`}>
            <td className="p-2 bg-grey">{major.major_name}</td>
            </Link>
          </tr>
        ))}
      </table>
    </div>
  );
};

export default Page;
