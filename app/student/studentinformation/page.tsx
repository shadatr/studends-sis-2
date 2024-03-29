'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { InfoDoctorType, MajorRegType,DepartmentRegType } from '@/app/types/types';
import { redirect } from 'next/navigation';

const stuInfo = [
  'الاسم',
  'اللقب',
  'رقم الطالب',
  'تاريخ الميلاد',
   'القسم' ,
  'التخصص',
  'الفصل الدراسي',
  'عنوان السكن',
  'رقم الهاتف',
  'الايميل',
  'تاريخ التسجيل',
  'المشرف',
  'حالة الطالب',
];

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a student, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }

  const [major, setMajor] = useState<string>();
  const [advisor, setAdvisor] = useState<string>();
    const [departments, setDepartments] = useState<DepartmentRegType[]>([]);

  const user = session.data?.user;

  useEffect(() => {
    const fetchPosts = async () => {
      if(user){
        const responseMaj = await axios.get(
          `/api/majorEnrollment/${user?.major}`
        );
        const messageMaj: MajorRegType[] = responseMaj.data.message;
        setMajor(messageMaj[0].major_name);
  
        axios.get('/api/department/departmentRegister').then((resp) => {
          const message: DepartmentRegType[] = resp.data.message;
          setDepartments(message);
        });
  
        axios.get(`/api/personalInfo/doctor/${user?.advisor}`).then((res) => {
          const message: InfoDoctorType[] = res.data.message;
          setAdvisor(message[0].name);
        });}
      };
  
    fetchPosts();
  }, [user]);



  return (
    <div className="flex w-[80%] absolute justify-center items-center mt-20">
      <table className=" text-sm  flex flex-row-reverse border border-gray-300 ">
        <thead>
          <tr className="flex flex-col bg-darkBlue text-secondary">
            {stuInfo.map((title, index) => (
              <th className="border border-gray-300 px-4 py-2" key={index}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="flex flex-col border border-gray-300 w-[600px] ">
            <td className="border border-gray-300 px-4 py-2 ">{user?.name}</td>
            <td className="border border-gray-300 px-4 py-2">
              {user?.surname}
            </td>
            <td className="border border-gray-300 px-4 py-2">{user?.id}</td>
            <td className="border border-gray-300 px-4 py-2">
              {user?.birth_date}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user?.department_id
                ? departments.find((dep) => dep.id == user?.department_id)?.name
                : 'غير محدد'}
            </td>

            <td className="border border-gray-300 px-4 py-2">
              {major ? major : 'غير محدد'}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user?.semester}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user?.address}
            </td>
            <td className="border border-gray-300 px-4 py-2">{user?.phone}</td>
            <td className="border border-gray-300 px-4 py-2">{user?.email}</td>
            <td className="border border-gray-300 px-4 py-2">
              {user?.enrollment_date}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {advisor ? advisor : 'غير محدد'}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {user?.graduated ? 'تخرج' : 'لم يتخرج'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Page;
