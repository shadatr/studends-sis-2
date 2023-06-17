'use client';
import {
  DoctorsWithDepartmentsType,
  GetPermissionType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AssignDepartment from '@/app/components/asignDepartment';
import { useSession } from 'next-auth/react';
import SearchBar from '@/app/components/searchBar';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;
  const [doctors, setDoctors] = useState<DoctorsWithDepartmentsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [selectedDoctor, setSelectedDoctor] =useState<DoctorsWithDepartmentsType>();

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/getAll/getDoctorsHeadOfDep').then((res) => {
        console.log(res.data);
        const message: DoctorsWithDepartmentsType[] = res.data.message;
        setDoctors(message);
      });
    };

    fetchPosts();
  }, [user?.id]);


  return (
    <div className="w-[80%] flex flex-col absolute justify-end pt-20">
      <SearchBar />
      <table className="border-collapse w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">
              المعلومات الشخصية
            </th>
            <th className="border border-gray-300 px-4 py-2">عميد كلية</th>
            <th className="border border-gray-300 px-4 py-2">التخصص</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">اسم</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  className=" bg-blue-500  hover:bg-blue-600 p-2 text-white rounded-md  justify-center items-center"
                  href={`/doctor/personalInformation/doctor/${user.id}`}
                >
                  الملف الشخصي
                </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.department ? (
                  <p>{user.department.name}</p>
                ) : (
                  <p className="text-red-500">لا يوجد </p>
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.major}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.surname}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
