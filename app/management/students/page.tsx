'use client';

import React, { useEffect, useState } from 'react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { MajorRegType, GetPermissionType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SearchBar from '@/app/components/searchBar';
import { redirect } from 'next/navigation';

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const responsePer = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const messagePer: GetPermissionType[] = responsePer.data.message;
      setPerms(messagePer);

      axios.get('/api/major/getMajors').then((resp) => {
        const message: MajorRegType[] = resp.data.message;
        setMajors(message);
      });
    };
    fetchPosts();
  }, [user]);

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%] mt-10">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 5 && permItem.active) {
          return (
            <div
              className="flex flex-row items-center justify-between w-[900px] text-sm"
              key={idx}
            >
              <Link
                className="bg-green-700 hover:bg-green-600 px-5 py-1 rounded-md text-white"
                href={'/management/students/register'}
              >
                سجل طالب جديد
              </Link>
            </div>
          );
        }
        return null;
      })}
      <SearchBar />
      <table className="w-[800px] mt-[50px] flex flex-col ">
        <thead>
          <tr className="flex flex-row w-full bg-darkBlue text-secondary">
            <th className="flex flex-row w-full p-1 items-center justify-end">
              اسم التخصص
            </th>
            <th className="flex flex-row w-1/5 items-center justify-center pr-2 pl-2">
              اسم الكلية
            </th>
            <th className="flex flex-row w-1/7 pr-2 pl-2 text-darkBlue">0</th>
          </tr>
        </thead>
        <tbody>
          {majors.map((item, index) => (
            <tr key={index} className="flex flex-row w-full">
              <td
                className="flex flex-row w-full p-1 items-center justify-end "
                key={index}
              >
                <Link
                  href={`/management/facultiesAndMajors/majorStudents/${item.id}`}
                >
                  {item.major_name}
                </Link>
              </td>
              <td className="flex flex-row w-1/5 items-center justify-center pr-2 pl-2 bg-lightBlue">
                {item.tb_departments?.name}
              </td>
              <td className="flex flex-row w-1/7 pr-2 pl-2 bg-lightBlue">
                {index + 1}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
