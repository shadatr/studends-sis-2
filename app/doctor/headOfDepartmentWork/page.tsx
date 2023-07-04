'use client';
import {
  MajorRegType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';


const Page = () => {

  const session = useSession({ required: true });

  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [majors, setMajors] = useState<MajorRegType[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      if (user){
        axios.get(`/api/major/getMajors/${user?.head_of_deparment_id}`).then((resp) => {
          console.log(resp.data);
          const message: MajorRegType[] = resp.data.message;
          setMajors(message);
        });
      }
    };
    fetchPosts();
  }, [user]);


  return (
    <div className="flex absolute items-center justify-center w-[80%] mt-10">
      {user?.head_of_deparment_id ? (
        <div>
          <Link
            className="bg-blue-700 m-10 hover:bg-blue-600 px-5 py-2 rounded-md text-white text-sm"
            href={`/doctor/headOfDepartmentWork/doctors`}
          >
            الدكاترة
          </Link>
          <table className="w-[1000px] m-5">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-gray-200 text-gray-700"></th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">التخصص</th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">الكلية</th>
              </tr>
            </thead>
            <tbody>
              {majors.length ? (
                majors.map((item, index) => (
                  <tr key={index} className="">
                    <td className="border border-gray-300 px-4 py-2 w-2/5">
                      <Link
                        className="bg-blue-700  hover:bg-blue-600 px-5 py-2 m-1 rounded-md text-white"
                        href={`/doctor/headOfDepartmentWork/majorStudents/${item.id}`}
                      >
                        الطلاب
                      </Link>
                      <Link
                        className="bg-blue-700  hover:bg-blue-600 px-5 py-2 m-1 rounded-md text-white"
                        href={`/doctor/headOfDepartmentWork/majorExamProg/${item.id}`}
                      >
                        جدول الامتحانات
                      </Link>
                      <Link
                        className="bg-blue-700  hover:bg-blue-600 px-5 py-2 m-1 rounded-md text-white"
                        href={`/doctor/headOfDepartmentWork/course/${item.id}`}
                      >
                        المواد
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.major_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 w-1/6">
                      {item.tb_departments?.name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    لا يوجد تخصصات حاليا
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm bg-grey text-red-600 p-3 w-[500px] flex items-center justify-center">
          لست عميد لاي كلية
        </div>
      )}
    </div>
  );
};

export default Page;
