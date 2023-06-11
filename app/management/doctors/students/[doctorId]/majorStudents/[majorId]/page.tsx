'use client';
import {
  InfoDoctorType,
  GetPermissionType,
  RegisterStudent2Type,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Page = ({
  params,
}: {
  params: { doctorId: number; majorId: number };
}) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;
  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [doctors, setDoctors] = useState<InfoDoctorType[]>([]);
  const [students, setStudents] = useState<RegisterStudent2Type[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        console.log(user);

        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message: GetPermissionType[] = response.data.message;
        setPerms(message);

        axios.get(`/api/list/${params.majorId}/student`).then((resp) => {
          const message: RegisterStudent2Type[] = resp.data.message;
          setStudents(message);
          
        });

        axios.get('/api/getAll/getDoctorsHeadOfDep').then((res) => {
          console.log(res.data);
          const message: InfoDoctorType[] = res.data.message;
          setDoctors(message);
        });
      }
    };
    fetchPosts();
  }, [user, refresh, params.majorId]);

  const handleCheck = (item: RegisterStudent2Type) => {
    const checkedIndex = checked.indexOf(item.id);
    if (checkedIndex === -1) {
      setChecked([...checked, item.id]);
    } else {
      const updatedChecked = [...checked];
      updatedChecked.splice(checkedIndex, 1);
      setChecked(updatedChecked);
    }
  };

  const handleSubmit = () => {
    console.log(checked);
    checked.map((item) => {
      const data = { 
        id: item,
        advisor: params.doctorId,
      };
      axios.post('/api/advisor/assignAdvisor/1', data);
      setRefresh(!refresh);
    });
  };

  return (
    <div className="flex absolute flex-col w-[80%]">
      <button
        onClick={handleSubmit}
        className="w-[200px] text-sm bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md flex justify-center items-center m-5"
      >
        عين الدكتور كمشرف
      </button>
      <table className="border-collapse mt-8">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">اختر</th>
            <th className="border border-gray-300 px-4 py-2">المشرف</th>
            <th className="border border-gray-300 px-4 py-2">
              المعلومات الشخصية
            </th>
            <th className="border border-gray-300 px-4 py-2"> التخصص</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">اسم</th>
          </tr>
        </thead>
        {students ? (
          <tbody>
            {students.map((student, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    className="p-2 ml-9"
                    type="checkbox"
                    onChange={() => handleCheck(student)}
                    checked={checked.includes(student.id)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.advisor
                    ? doctors.find((doc) => student.advisor == doc.id)?.name
                    : 'لا يوجد'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <Link
                    href={`/management/personalInformation/student/${student.id}`}
                    className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                  >
                    الملف الشخصي
                  </Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.major}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.surname}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.name}
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <div className="h-full flex justify-center items-center w-full">
            <h1 className="flex flex-row justify-center items-center text-2xl">
              لا يوجد طلاب
            </h1>
          </div>
        )}
      </table>
    </div>
  );
};

export default Page;
