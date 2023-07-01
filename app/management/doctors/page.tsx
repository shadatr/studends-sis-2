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
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [doctors, setDoctors] = useState<DoctorsWithDepartmentsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorsWithDepartmentsType>();

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message: GetPermissionType[] = response.data.message;
      setPerms(message);
      console.log(message);

      axios.get('/api/getAll/getDoctorsHeadOfDep').then((res) => {
        console.log(res.data);
        const message: DoctorsWithDepartmentsType[] = res.data.message;
        setDoctors(message);
      });
    };
    fetchPosts();
  }, [user?.id]);

  return (
    <div className="flex absolute flex-col w-[80%] justify-center items-center mt-10">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 9 && permItem.active) {
          return (
            <Link
              key={idx}
              className="btn_base w-[200px] mb-3"
              href={'/management/doctors/register'}
            >
              اضافة عضو
            </Link>
          );
        }
        return null;
      })}
      <SearchBar />
      <table className="border-collapse w-[1100px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">
              المعلومات الشخصية
            </th>
            <th className="border border-gray-300 px-4 py-2">رئيس قسم</th>
            <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">اسم</th>
          </tr>
        </thead>
        <AssignDepartment
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          selectedDoctor={selectedDoctor}
          doctors={doctors}
          setdoctors={setDoctors}
        />
        <tbody>
          {doctors.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  className=" bg-blue-500  hover:bg-blue-600 p-2 text-white rounded-md  justify-center items-center"
                  href={`/management/personalInformation/doctor/${user.id}`}
                >
                  الملف الشخصي
                </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2 flex justify-between">
                {perms.map((permItem) => {
                  if (permItem.permission_id === 9 && permItem.active) {
                    return (
                      <button
                        key={index}
                        className="bg-green-500 hover:bg-green-600 px-5 py-1 rounded-md text-white"
                        onClick={() => {
                          setSelectedDoctor(user);
                          setIsModalOpen(true);
                        }}
                      >
                        تعين
                      </button>
                    );
                  }
                  return null;
                })}

                {user.department ? (
                  <p>{user.department.name}</p>
                ) : (
                  <p className="text-red-500">لا يوجد </p>
                )}
              </td>

              <td className="border border-gray-300 px-4 py-2">
                {user.doctorSince}
              </td>
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
