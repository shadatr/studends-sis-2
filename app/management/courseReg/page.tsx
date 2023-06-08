/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  GetPermissionStudentType,
  MajorRegType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';


const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }

  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [active, setActive] = useState<boolean>();


  const handleActivate = () => {
    setActive(!active);
    const data = { active: active };
    axios
      .post('/api/allPermission/student/courseRegActive', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
      });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      
      axios.get('/api/major/majorReg').then((resp) => {
        const message: MajorRegType[] = resp.data.message;
        setMajors(message);
      });

      const responseActive = await axios.get(
        `/api/allPermission/student/courseRegActive`
      );
      const messageActive: GetPermissionStudentType[] =responseActive.data.message;
      setActive(messageActive[0].active);
      console.log(messageActive);
    };
    fetchPosts();
  }, []);

  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      <button
        onClick={() => {
          handleActivate();
        }}
        className={`text-white py-1 px-2 rounded ${
          active
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {active ? ' فتح تسجيل المواد ' : 'اغلاق تسجيل المواد'}
      </button>
      <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
        تخصصات
      </p>
      <table className="w-[1000px] flex flex-col">
        <thead className="bg-darkBlue text-secondary">
          <tr className="flex flex-row w-full">
            <th className="flex flex-row w-full p-1 items-center justify-end pr-2 pl-2">
              التخصصات
            </th>
            <th className="flex flex-row  w-1/4  p-1 items-center justify-end pr-2 pl-2">
              الكليات
            </th>
            <th className="flex flex-row w-1/8 p-1 items-center justify-end pr-2 pl-2">
              {' 0'}
            </th>
          </tr>
        </thead>
        <tbody>
          {majors.map((item, index) => (
            <tr key={index} className="flex flex-row w-full">
              <td className="flex flex-row w-full p-1 items-center justify-end pr-2 pl-2">
                <Link href={`/management/course/${item.id}`}>
                  {item.major_name}
                </Link>
              </td>
              <td className="flex flex-row w-1/4 p-1 items-center justify-end pr-2 pl-2">
                {item.tb_departments?.name}
              </td>
              <td className="flex flex-row w-1/8 p-1 items-center justify-end pr-2 pl-2">
                {index + 1}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default page;
