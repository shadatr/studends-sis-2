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
      {user?.head_of_deparment_id? (
      <table className="w-[800px]">
        <th className="p-2 bg-darkBlue text-secondary">اسم التخصص</th>
        {majors.map((major, index) => (
          <tr key={index}>
            <Link href={`/doctor/headOfDepartmentWork/major/${major.id}`}>
              <td className="p-2 bg-grey flex justify-end">{major.major_name}</td>
            </Link>
          </tr>
        ))}
      </table>
      ): (<div className='text-sm bg-grey text-red-600 p-3 w-[500px] flex items-center justify-center'>لست عميد لاي كلية</div>)}
    </div>
  );
};

export default Page;
